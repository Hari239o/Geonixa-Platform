export async function uploadFileToR2(file: File, type: 'public' | 'private'): Promise<string> {
  // 1. Request a presigned URL from the backend API
  const presignResponse = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      type: type,
      contentType: file.type || 'application/octet-stream',
    }),
  });

  const presignData = await presignResponse.json();
  
  if (!presignResponse.ok || !presignData.success) {
    throw new Error(presignData.error || 'Failed to get upload URL');
  }

  const { presignedUrl, url } = presignData;

  // 2. Upload the file directly to Cloudflare R2 using the presigned URL
  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to storage bucket');
  }

  // 3. Return the final public or private identifier URL
  return url;
}
