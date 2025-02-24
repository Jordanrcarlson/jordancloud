/*
  # Allow public uploads without authentication

  1. Changes
    - Update storage policies to allow public uploads
    - Update media table policies to allow public uploads
  
  2. Security
    - Anyone can upload files to the public folder
    - Files are still validated for size and type on the client side
*/

-- Update storage policies to allow public uploads
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

CREATE POLICY "Anyone can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Update media table policies to allow public inserts
DROP POLICY IF EXISTS "Authenticated users can insert public media" ON media;

CREATE POLICY "Anyone can insert public media"
ON media
FOR INSERT
WITH CHECK (folder = 'public');