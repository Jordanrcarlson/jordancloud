/*
  # Storage setup for media uploads

  1. Storage
    - Create media bucket for storing photos and videos
  2. Security
    - Enable public access for viewing
    - Allow authenticated users to upload
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');