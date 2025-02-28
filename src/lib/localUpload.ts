export async function localUpload(file: File, path: string) {
  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  // Send to local endpoint
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${await response.text()}`);
  }

  return response;
} 