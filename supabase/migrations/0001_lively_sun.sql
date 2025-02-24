/*
  # Initial Schema for Photo Sharing App

  1. New Tables
    - `media`
      - `id` (uuid, primary key)
      - `url` (text)
      - `type` (text)
      - `folder` (text)
      - `created_at` (timestamp)
    - `personal_folder`
      - `id` (uuid, primary key)
      - `password_hash` (text)
      - `authenticated` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Media table for storing photo and video metadata
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  folder text NOT NULL CHECK (folder IN ('public', 'personal')),
  created_at timestamptz DEFAULT now()
);

-- Personal folder authentication table
CREATE TABLE personal_folder (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  authenticated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_folder ENABLE ROW LEVEL SECURITY;

-- Policies for media table
CREATE POLICY "Anyone can view public media"
  ON media
  FOR SELECT
  USING (folder = 'public');

CREATE POLICY "Authenticated users can insert public media"
  ON media
  FOR INSERT
  TO authenticated
  WITH CHECK (folder = 'public');

CREATE POLICY "Authenticated and verified users can access personal media"
  ON media
  FOR ALL
  TO authenticated
  USING (
    folder = 'personal' AND
    EXISTS (
      SELECT 1 FROM personal_folder
      WHERE authenticated = true
    )
  );

-- Policies for personal_folder table
CREATE POLICY "Authenticated users can view personal folder status"
  ON personal_folder
  FOR SELECT
  TO authenticated;

-- Function to verify personal folder password
CREATE OR REPLACE FUNCTION verify_personal_folder(folder_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM personal_folder
    WHERE password_hash = crypt(folder_password, password_hash)
  ) THEN
    UPDATE personal_folder
    SET authenticated = true;
  ELSE
    RAISE EXCEPTION 'Invalid password';
  END IF;
END;
$$;