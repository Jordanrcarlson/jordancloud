import React, { useEffect, useState } from 'react';
import { Upload, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { MediaGrid } from '../components/MediaGrid';
import { supabase } from '../lib/supabase';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
}

export function Personal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('personal_folder')
        .select('authenticated')
        .single();
      
      if (!error && data?.authenticated) {
        setIsAuthenticated(true);
        loadMediaItems();
      }
    }
    setIsLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.rpc('verify_personal_folder', {
        folder_password: password
      });

      if (error) throw error;
      
      setIsAuthenticated(true);
      loadMediaItems();
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Incorrect password');
    }
  };

  const loadMediaItems = async () => {
    try {
      const { data: files, error } = await supabase
        .from('media')
        .select('*')
        .eq('folder', 'personal')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(files);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      setIsLoading(true);
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `personal/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('media')
          .insert([{
            url: publicUrl,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            folder: 'personal'
          }]);

        if (dbError) throw dbError;
      }

      loadMediaItems();
    } catch (error) {
      console.error('Error uploading:', error);
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

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 text-indigo-600 mx-auto" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">Protected Folder</h2>
            <p className="mt-2 text-gray-600">Enter the password to access Jordan's Personal Folder</p>
          </div>
          
          <form onSubmit={handleAuth}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Jordan's Personal Folder</h1>
        <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
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