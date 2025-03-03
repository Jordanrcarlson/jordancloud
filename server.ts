import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import multer from 'multer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Server paths:', {
  __dirname,
  uploadDir: join(__dirname, 'public', 'images'),
  cwd: process.cwd()
});

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Serve static files with logging
app.use(express.static(join(__dirname, 'public')));  // Serve entire public directory
app.use('/images', (req, res, next) => {
  console.log('Static file request:', {
    url: req.url,
    path: join(__dirname, 'public', 'images', req.url),
    exists: existsSync(join(__dirname, 'public', 'images', req.url))
  });
  next();
}, express.static(join(__dirname, 'public', 'images')));

// Configure multer
const uploadDir = join(__dirname, 'public', 'images');
await mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });
      
      console.log('Upload directory:', {
        path: uploadDir,
        exists: existsSync(uploadDir),
        isWritable: true // We'll check this
      });
      
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error setting up upload directory:', error);
      cb(error as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.originalname.split('.').pop();
    const filename = `${timestamp}-${random}.${ext}`;
    
    console.log('Generating filename:', {
      original: file.originalname,
      generated: filename
    });
    
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Log the file details
    console.log('File saved:', {
      filename: req.file.filename,
      path: req.file.path,
      fullPath: join(__dirname, 'public', 'images', req.file.filename)
    });

    res.json({
      success: true,
      path: `/images/${req.file.filename}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 