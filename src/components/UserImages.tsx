//src/components/UserImages.tsx



'use client';

import React, { useEffect, useState } from 'react';
import listUserImages from '@/utils/listUserImages';
import uploadToS3 from '@/utils/uploadToS3';
import Image from 'next/image';
import Modal from './Modal';
import { Copy, ExternalLink } from 'lucide-react';

interface UserImagesProps {
  userId: string;
}

const UserImages: React.FC<UserImagesProps> = ({ userId }) => {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imageUrls = await listUserImages(userId);
        const filteredImages = imageUrls.filter(url => /\.(jpe?g|png)$/i.test(url)); // Filter out non-image files
        setImages(filteredImages);
      } catch (error) {
        setError('Failed to load images');
      }
    };

    fetchImages();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

    try {
      const uploadedImageUrl = await uploadToS3(file, userId);
      if (uploadedImageUrl) {
        setImages([...images, uploadedImageUrl]);
        setFile(null);
        setError(null);
      } else {
        setError('Failed to upload image');
      }
    } catch (error) {
      setError('Error uploading image');
      console.error('Error uploading image:', error);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard');
  };

  const trimUrl = (url: string) => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md border dark:border-white mb-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Uploaded Images</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative w-full cursor-pointer" onClick={() => handleImageClick(url)}>
              <Image src={url} alt={`Uploaded Image ${index + 1}`} width={200} height={200} className="object-cover rounded-md" />
              <div className="mt-2 flex items-center justify-between">
                <span className="truncate">{trimUrl(url)}</span>
                <div className="flex items-center">
                  <Copy className="ml-2 cursor-pointer" size={16} onClick={() => copyToClipboard(url)} />
                  <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2">
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {modalOpen && selectedImage && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
            <div className="flex flex-col items-center">
              <Image src={selectedImage} alt="Enlarged Image" width={600} height={400} className="w-full h-auto object-contain" />
              <div className="mt-4 flex justify-between items-center w-full">
                <span className="truncate">{trimUrl(selectedImage)}</span>
                <div className="flex items-center">
                  <Copy className="ml-2 cursor-pointer" size={16} onClick={() => copyToClipboard(selectedImage)} />
                  <a href={selectedImage} target="_blank" rel="noopener noreferrer" className="ml-2">
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md border dark:border-white">
        <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Upload New Image</h1>
        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
        <button onClick={handleUpload} className="mt-4 w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800">
          Upload Image
        </button>
      </div>
    </div>
  );
};

export default UserImages;
