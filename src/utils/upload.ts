export async function uploadFileToR2(file: File, type: 'public' | 'private'): Promise<string> {
  // 1. Request a presigned URL from the backend API
  let presignResponse;
  try {
    presignResponse = await fetch('/api/upload', {
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
  } catch (e: any) {
    throw new Error('Network error when contacting /api/upload: ' + e.message);
  }

  const presignData = await presignResponse.json();
  
  if (!presignResponse.ok || !presignData.success) {
    throw new Error('API Error: ' + (presignData.error || 'Failed to get upload URL'));
  }

  const { presignedUrl, url } = presignData;

  // 2. Upload the file directly to Cloudflare R2 using the presigned URL
  let uploadResponse;
  try {
    uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });
  } catch (e: any) {
    throw new Error('Network error uploading to R2: ' + e.message);
  }

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error('Failed to upload file to storage bucket. Status: ' + uploadResponse.status + ' Msg: ' + errorText);
  }

  // 3. Return the final public or private identifier URL
  return url;
}
