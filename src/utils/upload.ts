export async function uploadFileToR2(file: File, type: 'public' | 'private'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload file');
  }

  return data.url;
}
