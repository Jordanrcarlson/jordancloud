-- Insert a row in personal_folder if it doesn't exist
INSERT INTO personal_folder (password_hash)
SELECT crypt('J8rdan8338', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM personal_folder);

-- Update existing row if it exists
UPDATE personal_folder
SET password_hash = crypt('J8rdan8338', gen_salt('bf'))
WHERE EXISTS (SELECT 1 FROM personal_folder);