/*
  # Update Personal Folder Policies
  
  1. Changes
    - Update policies to allow media uploads for users with correct password
    - Remove authenticated user requirement for personal folder access
  
  2. Security
    - Maintain password protection
    - Allow uploads for anyone with correct password
*/

-- Drop existing policy for personal media
DROP POLICY IF EXISTS "Authenticated and verified users can access personal media" ON media;

-- Create new policies for personal media
CREATE POLICY "Password verified users can access personal media"
  ON media
  FOR ALL
  USING (
    folder = 'personal' AND
    EXISTS (
      SELECT 1 FROM personal_folder
      WHERE authenticated = true
    )
  )
  WITH CHECK (
    folder = 'personal' AND
    EXISTS (
      SELECT 1 FROM personal_folder
      WHERE authenticated = true
    )
  );

-- Update personal_folder policies
DROP POLICY IF EXISTS "Authenticated users can view personal folder status" ON personal_folder;

CREATE POLICY "Anyone can view personal folder status"
  ON personal_folder
  FOR SELECT
  USING (true);