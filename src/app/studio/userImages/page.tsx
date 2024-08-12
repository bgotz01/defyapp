//src/app/studio/userImages/page.tsx



'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserImages from '@/components/UserImages';
import { useRouter } from 'next/navigation';

const UserImagesPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
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

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 pt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">My Uploaded Images</h1>
      <UserImages userId={userId} />
    </div>
  );
};

export default UserImagesPage;
