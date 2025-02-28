import { supabase } from './supabase';

export async function uploadMedia(file: File, folder: 'public' | 'personal') {
  // Validate file size (10MB limit)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error('File size must be less than 10MB');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/images/${fileName}`;

  try {
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);
    formData.append('folder', folder);

    console.log('Uploading file:', file.name); // Debug log
    console.log('To folder:', folder); // Debug log

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Upload response:', response.status, errorData); // Debug log
      throw new Error(`Upload failed: ${errorData?.error || response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Upload successful:', responseData); // Debug log

    // Insert into media table
    const { error: dbError } = await supabase
      .from('media')
      .insert([{
        url: filePath,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        folder: folder
      }]);

    if (dbError) {
      console.error('Database error:', dbError); // Debug log
      throw dbError;
    }

    return filePath;
  } catch (error: unknown) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    } else {
      throw new Error('Failed to upload file: Unknown error');
    }
  }
}