import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from 'lucide-react';

interface Album {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface AlbumGridProps {
  albums: Album[];
  onRefresh: () => void;
}

export function AlbumGrid({ albums, onRefresh }: AlbumGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album) => (
        <Link
          key={album.id}
          to={`/albums/${album.id}`}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded-lg mb-4">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{album.name}</h3>
            {album.description && (
              <p className="mt-1 text-sm text-gray-600">{album.description}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}