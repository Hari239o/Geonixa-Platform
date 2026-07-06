const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID_PUBLIC,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY_PUBLIC,
    },
  });
  
  try {
    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME_PUBLIC,
      Key: 'test-file.txt',
      Body: 'hello world',
      ContentType: 'text/plain'
    });
    await s3Client.send(cmd);
    console.log('Upload success! URL:', process.env.R2_PUBLIC_URL + '/test-file.txt');
  } catch (e) {
    console.error('Upload failed:', e);
  }
}
run();
