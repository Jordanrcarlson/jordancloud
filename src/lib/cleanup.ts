import { supabase } from './supabase';
import { subDays } from 'date-fns';

export async function cleanupDeletedFiles() {
  try {
    // Get date 30 days ago
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    // Delete items older than 30 days
    const { error } = await supabase
      .from('media')
      .delete()
      .lt('deleted_at', thirtyDaysAgo)
      .not('deleted_at', 'is', null);

    if (error) throw error;
    
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup error:', error);
  }
} 