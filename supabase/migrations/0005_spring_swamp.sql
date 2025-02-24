/*
  # Fix personal folder verification function
  
  1. Changes
    - Update verify_personal_folder function to use proper WHERE clause
    - Add proper error handling
    - Ensure single row update
*/

CREATE OR REPLACE FUNCTION verify_personal_folder(folder_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  folder_id uuid;
BEGIN
  -- Get the ID of the matching folder
  SELECT id INTO folder_id
  FROM personal_folder
  WHERE password_hash = crypt(folder_password, password_hash)
  LIMIT 1;
  
  IF folder_id IS NULL THEN
    RAISE EXCEPTION 'Invalid password';
  END IF;

  -- Update only the matching row
  UPDATE personal_folder
  SET authenticated = true
  WHERE id = folder_id;
END;
$$;