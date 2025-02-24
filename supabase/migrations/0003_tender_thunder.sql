/*
  # Update Personal Folder Password
  
  Updates the password hash for the personal folder access
*/

UPDATE personal_folder
SET password_hash = crypt('J8rdan8338', gen_salt('bf'));