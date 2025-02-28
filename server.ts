import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: path.join(__dirname, 'public/images/uploaded/') });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.json({ path: `/images/uploaded/${req.file.filename}` });
});

app.listen(3000, () => {
  console.log('Upload server running on port 3000');
}); 