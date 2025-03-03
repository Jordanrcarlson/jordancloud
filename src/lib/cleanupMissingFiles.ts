import { supabase } from './supabase';
import path from 'path';
import { existsSync } from 'fs';

export async function cleanupMissingFiles() {
  try {
    // Get all media entries
    const { data: media, error } = await supabase
      .from('media')
      .select('id, url')
      .is('deleted_at', null);

    if (error) throw error;

    // Check each file
    const missingIds = media?.filter(item => {
      const filename = item.url.split('/').pop();
      const filepath = path.join(process.cwd(), 'public', 'images', filename);
      
      // Add logging
      console.log('Checking file:', {
        url: item.url,
        filename,
        filepath,
        exists: existsSync(filepath)
      });
      
      return !existsSync(filepath);
    }).map(item => item.id) || [];

    if (missingIds.length > 0) {
      // Mark missing files as deleted
      const { error: updateError } = await supabase
        .from('media')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', missingIds);

      if (updateError) throw updateError;
      console.log(`Marked ${missingIds.length} missing files as deleted`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
} 