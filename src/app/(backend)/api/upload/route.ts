import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, type, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json({ success: false, error: 'Filename and contentType are required' }, { status: 400 });
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

    const fileExtension = filename.split('.').pop() || '';
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // Generate presigned URL for the client to upload to directly
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    let fileUrl = '';
    if (isPublic) {
      const publicUrlBase = process.env.R2_PUBLIC_URL || '';
      fileUrl = `${publicUrlBase}/${uniqueFilename}`;
    } else {
      fileUrl = `private://${uniqueFilename}`;
    }

    return NextResponse.json({
      success: true,
      presignedUrl,
      url: fileUrl,
      filename: uniqueFilename
    });

  } catch (error: any) {
    console.error('R2 Presign Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
