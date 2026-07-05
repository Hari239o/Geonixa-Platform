import { NextResponse } from 'next/server';
import { Knock } from '@knocklabs/node';

// Initialize the Knock Node SDK
// Since this is server-side, we use the Secret API Key
const knock = new Knock(process.env.KNOCK_SECRET_API_KEY as string);

export async function POST(request: Request) {
  try {
    const { userId, message, actionLabel, actionUrl, type = 'info' } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real application, you would create a Workflow in Knock and trigger it by its key.
    // However, since we are doing a dynamic implementation without requiring the user
    // to build out an entire Knock workflow manually, we can use the inline workflow
    // or trigger a default workflow if they set one up. 
    // BUT Knock requires a workflow to exist. If they haven't created one, triggering will fail.
    // So we will just use their default In-App channel ID directly if we can't trigger a workflow.
    // Wait, the Knock Node SDK requires a workflow trigger:
    // knock.workflows.trigger('workflow-key', { recipients, data })
    // If we don't have a workflow, we can use the new Messages API or just trigger a dynamic event.
    
    // For MVP, we assume they will create a workflow called "in-app-notification", 
    // or we can use the messages API to inject directly into a feed if Knock supports it.
    // Actually, it's safer to just trigger a workflow. We'll use 'default-notification' as the key.
    // The user will need to create a simple workflow in Knock with this key that routes to the in-app feed.
    
    const workflowKey = 'default-notification';

    await knock.workflows.trigger(workflowKey, {
      recipients: [userId],
      data: {
        message,
        actionLabel: actionLabel || 'View',
        actionUrl: actionUrl || '/',
        type
      }
    });

    return NextResponse.json({ success: true, message: 'Notification sent successfully' });
  } catch (error: any) {
    console.error('Failed to send notification:', error);
    
    // If it's a workflow not found error, provide a helpful message
    if (error.message?.includes('workflow')) {
       return NextResponse.json({ 
         success: false, 
         error: 'Please create a workflow in Knock with the key "default-notification" that routes to your In-App Feed channel.' 
       }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
