import { readdir } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const imagesDirPath = path.join(process.cwd(), 'public', 'images');
    console.log('Checking directory:', imagesDirPath);
    
    const files = await readdir(imagesDirPath);
    console.log('Raw files found:', files);
    
    // If no files found, return empty array
    if (files.length === 0) {
      console.log('No files found in directory');
      return res.status(200).json({ files: [] });
    }

    const filePaths = files.map(file => `/images/${file}`);
    console.log('Sending file paths:', filePaths);
    
    return res.status(200).json({ files: filePaths });
  } catch (error) {
    console.error('Error reading directory:', error);
    return res.status(500).json({ 
      message: 'Error listing files',
      error: error.message 
    });
  }
} 