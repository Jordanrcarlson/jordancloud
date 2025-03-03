import { watch } from 'fs';
import path from 'path';
import { supabase } from './supabase';

export function watchFiles() {
  const uploadDir = path.join(process.cwd(), 'public', 'images');
  
  watch(uploadDir, async (eventType, filename) => {
    if (eventType === 'rename' && filename) {  // rename event happens on delete
      // Check if file was deleted
      const fullPath = path.join(uploadDir, filename);
      const fileUrl = `/images/${filename}`;
      
      try {
        // Mark as deleted in database if file doesn't exist
        const { error } = await supabase
          .from('media')
          .update({ deleted_at: new Date().toISOString() })
          .eq('url', fileUrl)
          .is('deleted_at', null);

        if (error) throw error;
        console.log(`Marked ${filename} as deleted`);
      } catch (error) {
        console.error('Error updating database:', error);
      }
    }
  });
  
  console.log('Watching for file changes in:', uploadDir);
} 