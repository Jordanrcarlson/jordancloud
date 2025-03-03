import Masonry from 'react-masonry-css';
import { Play, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { MediaItem } from '../types';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface MediaGridProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  showRestore?: boolean;
  onRestore?: (id: string) => void;
}

export function MediaGrid({ items, onSelect }: MediaGridProps) {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());

  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, item: MediaItem) => {
    console.error('Image failed to load:', {
      url: item.url,
      error: e.currentTarget.src,
      fullPath: new URL(e.currentTarget.src).pathname
    });
    setFailedItems(prev => new Set([...prev, item.id]));
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video failed to load:', e.currentTarget.src);
    e.currentTarget.style.display = 'none';  // Hide broken videos
  };

  const handleItemClick = (item: MediaItem) => {
    if (isSelectMode) {
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else {
      onSelect(item);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${selectedItems.size} items?`)) return;

    try {
      // Soft delete - update deleted_at timestamp
      const { error: dbError } = await supabase
        .from('media')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', Array.from(selectedItems));

      if (dbError) throw dbError;

      // Reset selection mode
      setIsSelectMode(false);
      setSelectedItems(new Set());

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete some items');
    }
  };

  // In the render, filter out failed items
  const displayItems = items.filter(item => !failedItems.has(item.id));

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => {
            setIsSelectMode(!isSelectMode);
            setSelectedItems(new Set());
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {isSelectMode ? 'Cancel' : 'Select Photos'}
        </button>
        
        {isSelectMode && selectedItems.size > 0 && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 inline-block mr-2" />
            Delete Selected ({selectedItems.size})
          </button>
        )}
      </div>

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={`mb-4 relative group cursor-pointer rounded-lg overflow-hidden ${
              isSelectMode && selectedItems.has(item.id) ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => handleItemClick(item)}
          >
            {item.type === 'image' ? (
              <div>
                <img
                  src={item.url}
                  alt=""
                  onError={(e) => handleImageError(e, item)}
                  className="w-full h-auto object-cover rounded-lg transition-transform group-hover:scale-105"
                />
                {errors[item.id] && (
                  <div className="p-2 text-red-500 text-sm">
                    {errors[item.id]}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <video
                  src={item.url}
                  onError={handleVideoError}
                  className="w-full h-auto object-cover rounded-lg"
                  preload="metadata"
                  controls
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-75" />
                </div>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm">
                {format(new Date(item.created_at), 'MMM d, yyyy')}
              </p>
            </div>

            {isSelectMode && (
              <div className="absolute top-2 right-2">
                <CheckCircle 
                  className={`w-6 h-6 ${
                    selectedItems.has(item.id) 
                      ? 'text-indigo-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </div>
            )}
          </div>
        ))}
      </Masonry>
    </div>
  );
}