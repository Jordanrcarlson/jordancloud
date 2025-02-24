/*
  # Add Albums and Deleted Items Features

  1. New Tables
    - `albums`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    - `album_items`
      - `id` (uuid, primary key)
      - `album_id` (uuid, foreign key)
      - `media_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Changes
    - Add `deleted_at` column to media table
    - Add function to auto-delete after 30 days

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create albums table
CREATE TABLE albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create album items table
CREATE TABLE album_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES albums(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(album_id, media_id)
);

-- Add deleted_at column to media
ALTER TABLE media ADD COLUMN deleted_at timestamptz;

-- Enable RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_items ENABLE ROW LEVEL SECURITY;

-- Policies for albums
CREATE POLICY "Authenticated users can manage albums"
  ON albums
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for album items
CREATE POLICY "Authenticated users can manage album items"
  ON album_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to mark items as deleted
CREATE OR REPLACE FUNCTION mark_as_deleted()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE media
  SET deleted_at = now()
  WHERE id = current_setting('media.delete_id')::uuid;
END;
$$;

-- Function to permanently delete old items (runs daily via cron)
CREATE OR REPLACE FUNCTION cleanup_deleted_media()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM media
  WHERE deleted_at IS NOT NULL
  AND deleted_at < now() - interval '30 days';
END;
$$;