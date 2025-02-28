import { writeFile } from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10gb', // Adjust this limit as needed
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { file, filename } = req.body;
    // Remove data:image/[type];base64, from the beginning of the base64 string
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const imagePath = path.join(process.cwd(), 'public', 'images', filename);
    await writeFile(imagePath, buffer);

    res.status(200).json({ 
      message: 'File uploaded successfully',
      path: `/images/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
} 