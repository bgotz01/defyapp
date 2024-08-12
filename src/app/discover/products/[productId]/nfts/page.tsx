// src/app/discover/products/[productId]/nfts/page.tsx

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import NFTList from '@/app/components/NFTList';

const NFTsPage: React.FC = () => {
  const { productId } = useParams() as { productId: string };
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-black p-4">
      <div className="mb-4 self-start">
        <button 
          onClick={() => router.back()} 
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          &larr; Back
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">NFTs for Product ID: {productId}</h1>
      <NFTList productId={productId} />
    </div>
  );
};

export default NFTsPage;
