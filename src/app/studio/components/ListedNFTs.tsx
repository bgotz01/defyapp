// src/app/studio/components/ListedNFTs.tsx

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchListedNFTsByOwner } from '@/utils/nftMarket';
import Image from 'next/image';
import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';

interface ListedNFT {
  id: string;
  image: string;
  name: string;
  price: string;
}

const trimAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

const ListedNFTs: React.FC = () => {
  const { publicKey } = useWallet();
  const [listedNFTs, setListedNFTs] = useState<ListedNFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      fetchListedNFTsData(publicKey.toBase58());
    }
  }, [publicKey]);

  const fetchListedNFTsData = async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const nfts = await fetchListedNFTsByOwner(walletAddress);
      setListedNFTs(nfts);
    } catch (err) {
      setError('Failed to fetch listed NFTs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 pt-20 bg-white dark:bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-black dark:text-white">My Listed NFTs</h1>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listedNFTs.map((nft) => (
            <div key={nft.id} className="relative p-4 border rounded shadow hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer bg-white dark:bg-black group">
              <div className="relative h-64 w-full mb-4">
                {nft.image ? (
                  <Image
                    src={nft.image}
                    alt={`NFT ${nft.id}`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded"
                  />
                ) : (
                  <p>No Image Available</p>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex flex-col justify-end items-center opacity-0 group-hover:opacity-100 text-white text-xs p-2">
                <p className="font-semibold">{nft.name || 'Unknown'}</p>
                <Link href={`https://solana.fm/address/${nft.id}`} target="_blank" className="hover:text-gray-300 flex items-center">
                  {trimAddress(nft.id)} <FaExternalLinkAlt className="ml-1" />
                </Link>
                <p className="font-semibold">{nft.price || 'Unknown'} USDC</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListedNFTs;
