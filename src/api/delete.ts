import express from 'express';
import type { Request, Response } from 'express';
import { unlink } from 'fs/promises';
import path from 'path';

export const router = express.Router();

router.post('/delete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids, paths } = req.body;
    
    // Delete files from filesystem
    for (const filePath of paths) {
      if (filePath.startsWith('/images/')) {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        try {
          await unlink(fullPath);
        } catch (error) {
          console.error(`Failed to delete file ${fullPath}:`, error);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete files' });
  }
}); 