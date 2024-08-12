// src/app/discover/designers/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi'; // External link icon

interface Designer {
  _id: string;
  username: string;
  solanaWallet: string;
}

interface Collection {
  _id: string;
  name: string;
  collectionAddress: string;
  imageUrl: string;
}

const DesignersPage = () => {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [collections, setCollections] = useState<{ [key: string]: Collection[] }>({});

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/designers');
        const designersData = response.data;
        setDesigners(designersData);
        // Fetch collections for each designer
        designersData.forEach(async (designer: Designer) => {
          const collectionsResponse = await axios.get(`http://localhost:4000/api/collections/by-designer/${designer._id}`);
          setCollections(prevState => ({
            ...prevState,
            [designer._id]: collectionsResponse.data,
          }));
        });
      } catch (error) {
        console.error('Error fetching designers:', error);
      }
    };

    fetchDesigners();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-black p-4">
      <div className="w-full max-w-2xl space-y-4">
        {designers.map((designer: Designer) => (
          <Card key={designer._id} className="flex flex-col p-4 border rounded bg-card dark:bg-gray-800">
            <Link href={`/discover/designers/${designer._id}`} className="text-lg font-semibold text-gray-800 dark:text-gray-200 no-underline">
              {designer.username}
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              Solana Wallet: 
              <Link href={`https://solana.fm/address/${designer.solanaWallet}`} target="_blank" rel="noopener noreferrer" className="ml-1 flex items-center text-gray-600 dark:text-gray-400 no-underline">
                {designer.solanaWallet} <FiExternalLink className="ml-1" />
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {collections[designer._id]?.map((collection: Collection) => (
                <div key={collection._id} className="flex items-center space-x-4">
                  <Image src={collection.imageUrl} alt={collection.name} width={50} height={50} className="object-cover rounded-md" />
                  <div>
                    <span className="text-md font-medium text-gray-800 dark:text-gray-200 no-underline">
                      {collection.name}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      Collection Address: 
                      <Link href={`https://solana.fm/address/${collection.collectionAddress}`} target="_blank" rel="noopener noreferrer" className="ml-1 flex items-center text-gray-600 dark:text-gray-400 no-underline">
                        {collection.collectionAddress} <FiExternalLink className="ml-1" />
                      </Link>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DesignersPage;
