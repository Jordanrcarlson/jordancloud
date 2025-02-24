import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { MediaGrid } from '../components/MediaGrid';
import { supabase } from '../lib/supabase';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
  deleted_at: string;
}

export function Deleted() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data);
    } catch (error) {
      console.error('Error loading deleted items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) throw error;
      await loadDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Deleted Items</h1>
        <p className="mt-2 text-sm text-gray-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
          Items will be permanently deleted after 30 days
        </p>
      </div>

      <MediaGrid
        items={mediaItems}
        onSelect={setSelectedItem}
        showRestore
        onRestore={handleRestore}
      />

      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full">
            {selectedItem.type === 'image' ? (
              <img
                src={selectedItem.url}
                alt=""
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={selectedItem.url}
                controls
                className="w-full h-auto max-h-[80vh]"
              />
            )}
            <div className="absolute top-4 right-4 flex space-x-4">
              <button
                className="text-white hover:text-indigo-300"
                onClick={() => handleRestore(selectedItem.id)}
              >
                Restore
              </button>
              <button
                className="text-white hover:text-gray-300"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}