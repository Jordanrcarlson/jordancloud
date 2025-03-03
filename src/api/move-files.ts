import { rename, readdir } from 'fs/promises';
import path from 'path';

async function moveFiles() {
  try {
    const oldDir = path.join(process.cwd(), 'public', 'images', 'uploaded');
    const newDir = path.join(process.cwd(), 'public', 'images');
    
    // Move files from uploaded/ to images/
    const files = await readdir(oldDir);
    for (const file of files) {
      const oldPath = path.join(oldDir, file);
      const newPath = path.join(newDir, file);
      await rename(oldPath, newPath);
    }
  } catch (error) {
    console.error('Error moving files:', error);
  }
}

export { moveFiles }; 