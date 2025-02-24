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
  const filePath = `${folder}/${fileName}`;

  try {
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    // Insert into media table
    const { error: dbError } = await supabase
      .from('media')
      .insert([{
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        folder
      }]);

    if (dbError) throw dbError;

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
}