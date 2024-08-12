// src/app/studio/upload/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ImageDropzone from '@/components/ImageDropzone'; 
import JSONForm from '@/components/JSONForm'; 
import JSONUpload from '@/components/JSONUpload';

const UploadPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>(Array(5).fill(""));
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
    } else {
      axios.get('http://localhost:4000/api/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(response => {
        const { userId } = response.data;
        setUserId(userId);
      }).catch(error => {
        console.error('Error fetching user info:', error);
        router.push('/login');
      });
    }
  }, [router]);

  const handleImageUpload = (imageUrl: string, index: number) => {
    setUploadedImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = imageUrl;
      return newImages;
    });
  };

  const handleJsonUpload = (jsonUrl: string) => {
    console.log('JSON file uploaded to:', jsonUrl);
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-black p-4" style={{ paddingTop: '70px' }}>
      <h1 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">Upload Files</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(5)].map((_, index) => (
          <ImageDropzone key={index} userId={userId} onUpload={handleImageUpload} index={index} />
        ))}
      </div>
      <JSONForm uploadedImages={uploadedImages} />
      <JSONUpload userId={userId} onUpload={handleJsonUpload} />
    </div>
  );
};

export default UploadPage;
