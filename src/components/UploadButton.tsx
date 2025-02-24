import React from 'react';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isLoading: boolean;
}

export function UploadButton({ onUpload, isLoading }: UploadButtonProps) {
  return (
    <label className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <Upload className="h-4 w-4 mr-2" />
      {isLoading ? 'Uploading...' : 'Upload Media'}
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={onUpload}
        disabled={isLoading}
      />
    </label>
  );
}