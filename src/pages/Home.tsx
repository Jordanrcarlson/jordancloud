import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MediaGrid } from '../components/MediaGrid';
import { UploadButton } from '../components/UploadButton';
import { uploadMedia } from '../lib/upload';
import { supabase } from '../lib/supabase';
import { getImages } from '../files';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
  source?: 'supabase' | 'local';
}

export function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const loadMediaItems = async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true);
      
      // Load from Supabase
      const { data: supabaseFiles, error } = await supabase
        .from('media')
        .select('*')
        .eq('folder', 'public')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load local images
      const localImagePaths = await getImages();
      const localImages = localImagePaths.map((path, index) => ({
        id: `local-${index}`,
        url: path,
        type: 'image',
        created_at: new Date().toISOString(),
        source: 'local'
      }));

      // Only update if there are changes
      const newItems = [...supabaseFiles, ...localImages];
      const hasChanges = JSON.stringify(newItems) !== JSON.stringify(mediaItems);
      
      if (hasChanges) {
        setMediaItems(newItems);
      }
    } catch (error) {
      console.error('Error loading media:', error);
      if (!isPolling) alert('Failed to load media items');
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMediaItems();

    // Set up polling
    const interval = setInterval(() => {
      loadMediaItems(true);  // Pass true for polling
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file, 'public');
      }
      await loadMediaItems();
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload media');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDelete = async (mediaItem: MediaItem) => {
    try {
      // Extract filename from the URL
      const filename = mediaItem.url.split('/').pop();
      if (!filename) throw new Error('Invalid file path');

      // Delete the file
      const response = await fetch(`/api/delete/${filename}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaItem.id);

      if (error) throw error;

      // Refresh the media list
      await loadMediaItems();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete item');
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
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Photos & Videos</h1>
        <UploadButton onUpload={handleUpload} isLoading={isUploading} />
      </div>

      <MediaGrid items={mediaItems} onSelect={setSelectedItem} />

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
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}