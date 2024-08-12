// src/app/discover/closet/ClosetProfile.tsx

import React from 'react';
import Image from 'next/image';

interface ClosetProfileProps {
  name: string;
  imageUrl: string;
}

const ClosetProfile: React.FC<ClosetProfileProps> = ({ name, imageUrl }) => {
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <Image src={imageUrl} alt={`${name}'s Profile`} width={150} height={150} className="rounded-full" />
      <h2 className="text-xl font-bold mt-4 text-black dark:text-white">{name}</h2>
    </div>
  );
};

export default ClosetProfile;
