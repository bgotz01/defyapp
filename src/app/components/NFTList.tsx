// src/app/components/NFTList.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';

interface NFT {
  _id: string;
  tokenAddress: string;
  productId: { _id: string } | string;
  active: string;
}

interface NFTListProps {
  productId: string;
  onCountChange?: (count: number) => void; // Add a callback to notify parent about count
}

const NFTList: React.FC<NFTListProps> = ({ productId, onCountChange }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/public/nfts');
        console.log('Fetched NFTs:', response.data);

        const filteredNFTs = response.data.filter((nft: NFT) => {
          const nftProductId = typeof nft.productId === 'object' && nft.productId !== null ? nft.productId._id : nft.productId;
          return nftProductId === productId && nft.active === "yes";
        });

        console.log('Filtered NFTs:', filteredNFTs);

        setNfts(filteredNFTs);

        // Notify parent about the count
        if (onCountChange) {
          onCountChange(filteredNFTs.length);
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [productId, onCountChange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Skeleton className="h-10 w-full max-w-4xl rounded-lg mb-4 dark:bg-gray-800" />
        <Skeleton className="h-64 w-full max-w-4xl rounded-lg mb-4 dark:bg-gray-800" />
        <Skeleton className="h-64 w-full max-w-4xl rounded-lg mb-4 dark:bg-gray-800" />
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-lg text-gray-800 dark:text-gray-200">No NFTs found for this product.</p>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map(nft => (
        <Card key={nft._id} className="p-4">
          <p className="text-md text-gray-800 dark:text-gray-200">
            <strong>NFT ID:</strong> {nft._id}
          </p>
          <p className="text-md text-gray-800 dark:text-gray-200">
            <strong>Token Address:</strong> {nft.tokenAddress}
          </p>
          <Link href={`/marketplace/${nft.tokenAddress}`} className="text-blue-500 hover:underline">
            View NFT on Marketplace
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default NFTList;
