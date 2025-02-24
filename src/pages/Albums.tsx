import React, { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AlbumGrid } from '../components/AlbumGrid';
import { CreateAlbumModal } from '../components/CreateAlbumModal';

interface Album {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-semibold text-gray-900">Albums</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Album
        </button>
      </div>

      <AlbumGrid albums={albums} onRefresh={loadAlbums} />

      {isCreateModalOpen && (
        <CreateAlbumModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={loadAlbums}
        />
      )}
    </div>
  );
}