import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { mkdir } from 'fs/promises';

export const router = express.Router();

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      const uploadPath = path.join(process.cwd(), 'public', 'images');
      await mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    
    res.json({
      success: true,
      path: `/images/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 