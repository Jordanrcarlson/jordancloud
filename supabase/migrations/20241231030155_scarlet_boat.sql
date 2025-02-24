/*
  # Update album policies
  
  1. Changes
    - Drop existing RLS policy for albums
    - Add new policy to allow anyone to create and view albums
  
  2. Security
    - Allows public access to albums table
    - Anyone can create and view albums
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can manage albums" ON albums;

-- Create new public policies
CREATE POLICY "Anyone can manage albums"
  ON albums
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update album items policy to allow public access
DROP POLICY IF EXISTS "Authenticated users can manage album items" ON album_items;

CREATE POLICY "Anyone can manage album items"
  ON album_items
  FOR ALL
  USING (true)
  WITH CHECK (true);