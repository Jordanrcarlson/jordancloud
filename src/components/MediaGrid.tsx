import Masonry from 'react-masonry-css';
import { Play } from 'lucide-react';
import { format } from 'date-fns';
import { MediaItem } from '../types';

interface MediaGridProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  showRestore?: boolean;
  onRestore?: (id: string) => void;
}

export function MediaGrid({ items, onSelect }: MediaGridProps) {
  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="mb-4 relative group cursor-pointer rounded-lg overflow-hidden"
          onClick={() => onSelect(item)}
        >
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt=""
              className="w-full h-auto object-cover rounded-lg transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="relative">
              <video
                src={item.url}
                className="w-full h-auto object-cover rounded-lg"
                preload="metadata"
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
        </div>
      ))}
    </Masonry>
  );
}