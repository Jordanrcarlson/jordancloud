import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { MediaGrid } from '../components/MediaGrid';
import { UploadButton } from '../components/UploadButton';
import { uploadMedia } from '../lib/upload';
import { supabase } from '../lib/supabase';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
}

interface Album {
  id: string;
  name: string;
  description: string;
}

export function AlbumView() {
  const { id } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const loadAlbum = async () => {
    if (!id) return;

    try {
      // Load album details
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();

      if (albumError) throw albumError;
      setAlbum(albumData);

      // Load album media items
      const { data: items, error: itemsError } = await supabase
        .from('album_items')
        .select(`
          media_id,
          media:media_id (
            id,
            url,
            type,
            created_at
          )
        `)
        .eq('album_id', id);

      if (itemsError) throw itemsError;

      const mediaItems = items
        .map(item => item.media)
        .filter((item): item is MediaItem => item !== null);

      setMediaItems(mediaItems);
    } catch (error) {
      console.error('Error loading album:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length || !id) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const url = await uploadMedia(file, 'public');
        
        // Get the media item that was just created
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('url', url)
          .single();

        if (mediaError) throw mediaError;

        // Add to album
        const { error: albumError } = await supabase
          .from('album_items')
          .insert([{
            album_id: id,
            media_id: mediaData.id
          }]);

        if (albumError) throw albumError;
      }
      
      await loadAlbum();
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload media');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const loadAvailableMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('folder', 'public')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out media that's already in the album
      const existingIds = new Set(mediaItems.map(item => item.id));
      setAvailableMedia(data.filter(item => !existingIds.has(item.id)));
    } catch (error) {
      console.error('Error loading available media:', error);
    }
  };

  const handleAddExisting = async () => {
    if (!id || selectedMedia.size === 0) return;

    try {
      const items = Array.from(selectedMedia).map(mediaId => ({
        album_id: id,
        media_id: mediaId
      }));

      const { error } = await supabase
        .from('album_items')
        .insert(items);

      if (error) throw error;

      await loadAlbum();
      setShowMediaSelector(false);
      setSelectedMedia(new Set());
    } catch (error) {
      console.error('Error adding media to album:', error);
      alert('Failed to add media to album');
    }
  };

  const toggleMediaSelection = (mediaId: string) => {
    const newSelection = new Set(selectedMedia);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }
    setSelectedMedia(newSelection);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Album not found</h2>
        <p className="mt-2 text-gray-600">The album you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{album.name}</h1>
        {album.description && (
          <p className="mt-2 text-gray-600">{album.description}</p>
        )}
        
        <div className="mt-4 flex space-x-4">
          <UploadButton onUpload={handleUpload} isLoading={isUploading} />
          <button
            onClick={() => {
              setShowMediaSelector(true);
              loadAvailableMedia();
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Existing Media
          </button>
        </div>
      </div>

      <MediaGrid items={mediaItems} onSelect={setSelectedItem} />

      {/* Media selector modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">Add Existing Media</h2>
              <button
                onClick={() => setShowMediaSelector(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                Close
              </button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(80vh-8rem)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableMedia.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleMediaSelection(item.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden ${
                      selectedMedia.has(item.id) ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    {selectedMedia.has(item.id) && (
                      <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                        <div className="bg-indigo-500 text-white rounded-full p-1">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t">
              <button
                onClick={handleAddExisting}
                disabled={selectedMedia.size === 0}
                className={`w-full px-4 py-2 rounded-md text-white ${
                  selectedMedia.size > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Add Selected ({selectedMedia.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media viewer modal */}
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