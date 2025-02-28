import { useState, useEffect } from 'react';
import { getImages } from '../files';

const ImageDisplay = () => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      const paths = await getImages();
      setImages(paths);
    };

    loadImages();
  }, []);

  return (
    <div>
      <h2>Images</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {images.map((image, index) => (
          <div key={index}>
            <img 
              src={image} 
              alt={`Image ${index}`}
              style={{ 
                width: '100%', 
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageDisplay; 