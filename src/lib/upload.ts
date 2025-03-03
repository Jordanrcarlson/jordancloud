import { supabase } from './supabase';

export async function uploadMedia(file: File, folder: 'public' | 'personal') {
  try {
    if (!file.name.trim()) {
      throw new Error('Invalid filename');
    }

    // Validate file size
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size must be less than 10MB');
    }

    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    console.log('Attempting to connect to server...');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error('Server is not running or unreachable');
    });

    const data = await response.json();
    console.log('Upload response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    // Insert into media table
    const { error: dbError } = await supabase
      .from('media')
      .insert([{
        url: data.path,
        type: data.type,
        folder: folder
      }]);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return data.path;
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Upload failed: Unknown error');
  }
}