import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (type !== 'public' && type !== 'private') {
      return NextResponse.json({ success: false, error: 'Invalid upload type (must be public or private)' }, { status: 400 });
    }

    const isPublic = type === 'public';
    
    // Choose credentials based on bucket type
    const accessKeyId = isPublic ? process.env.R2_ACCESS_KEY_ID_PUBLIC : process.env.R2_ACCESS_KEY_ID_PRIVATE;
    const secretAccessKey = isPublic ? process.env.R2_SECRET_ACCESS_KEY_PUBLIC : process.env.R2_SECRET_ACCESS_KEY_PRIVATE;
    const bucketName = isPublic ? process.env.R2_BUCKET_NAME_PUBLIC : process.env.R2_BUCKET_NAME_PRIVATE;
    const endpoint = process.env.R2_ENDPOINT;

    if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
      console.error('Missing R2 environment variables');
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFilename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    let fileUrl = '';
    if (isPublic) {
      const publicUrlBase = process.env.R2_PUBLIC_URL || '';
      fileUrl = `${publicUrlBase}/${uniqueFilename}`;
    } else {
      // For private, return an identifier or a securely signed URL later if needed.
      // For now, returning the filename/key so the backend can fetch it later if necessary.
      fileUrl = `private://${uniqueFilename}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename
    });

  } catch (error: any) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
