export const getImages = async () => {
  try {
    // In Vite, we can use the special ?glob import syntax
    const imageFiles = import.meta.glob('/public/images/*');
    const imagePaths = Object.keys(imageFiles).map(path => 
      path.replace('/public', '')
    );
    return imagePaths;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};
