// src/components/ImageDropzone.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import uploadToS3 from '../utils/uploadToS3'; 
import Spinner from './Spinner'; 

interface ImageDropzoneProps {
  userId: string | null;
  onUpload: (imageUrl: string, index: number) => void;
  index: number;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ userId, onUpload, index }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; // Assuming single file upload
    if (file && userId) {
      setLoading(true);
      const uploadedImageUrl = await uploadToS3(file, userId);
      setLoading(false);
      if (uploadedImageUrl) {
        console.log('Image uploaded to S3:', uploadedImageUrl);
        setImageUrl(uploadedImageUrl);
        onUpload(uploadedImageUrl, index); // Notify parent component of the new upload
      } else {
        console.error('Failed to upload image to S3');
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  useEffect(() => {
    if (userId) {
      console.log(`User ID in ImageDropzone: ${userId}`);
    }
  }, [userId]);

  return (
    <div className="flex flex-col items-center mb-4">
      <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center', margin: '10px', width: '250px', height: '250px', position: 'relative' }}>
        <input {...getInputProps()} />
        {loading ? (
          <Spinner /> // Use the Spinner component here
        ) : imageUrl ? (
          <img src={imageUrl} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <p>Drag drop a file here, or click to select a file</p>
        )}
      </div>
      <input
        type="text"
        readOnly
        value={imageUrl || "image url"}
        className="mt-2 p-2 border rounded w-full text-center"
      />
    </div>
  );
};

export default ImageDropzone;
