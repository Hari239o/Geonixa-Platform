import { NextResponse } from 'next/server';
import { AIProctoringSystem } from '@/lib/aiProctoring/monitoring';

const proctoringSystem = new AIProctoringSystem();

// POST: Monitor user activity
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, videoStream, audioStream, activity } = body;

    if (!userId || !videoStream || !audioStream || !activity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let violationDetected = false;

    switch (activity) {
      case 'eyeMovement':
        violationDetected = proctoringSystem.monitorEyeMovement(videoStream);
        break;
      case 'headMovement':
        violationDetected = proctoringSystem.monitorHeadMovement(videoStream);
        break;
      case 'faceVisibility':
        violationDetected = proctoringSystem.monitorFaceVisibility(videoStream);
        break;
      case 'phoneDetection':
        violationDetected = proctoringSystem.detectPhone(videoStream);
        break;
      case 'multiplePersons':
        violationDetected = proctoringSystem.detectMultiplePersons(videoStream);
        break;
      case 'loudNoise':
        violationDetected = proctoringSystem.detectLoudNoise(audioStream);
        break;
      case 'tabSwitching':
        violationDetected = proctoringSystem.monitorTabSwitching();
        if (violationDetected) {
          proctoringSystem.instantTerminate(userId, 'Tab switching');
          return NextResponse.json({ message: 'Exam terminated due to tab switching' });
        }
        break;
      case 'screenshotAttempt':
        violationDetected = proctoringSystem.monitorScreenshotAttempts();
        if (violationDetected) {
          proctoringSystem.instantTerminate(userId, 'Screenshot attempt');
          return NextResponse.json({ message: 'Exam terminated due to screenshot attempt' });
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    if (violationDetected) {
      proctoringSystem.handleWarning(userId);
    }

    return NextResponse.json({ message: 'Activity monitored successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to monitor activity' }, { status: 500 });
  }
}