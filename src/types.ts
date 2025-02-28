export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
  deleted_at?: string;
}

export interface AlbumItem {
  media_id: string;
  media: MediaItem | null;
}

export interface Album {
  id: string;
  name: string;
  description: string;
  created_at: string;
} 