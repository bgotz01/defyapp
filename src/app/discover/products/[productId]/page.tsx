// src/app/discover/products/[productId]/page.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  productAddress: string;
  description: string;
  price: number;
  imageUrl1: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  imageUrl5?: string;
  collectionAddress: string;
  designerId: string;
  username: string;
  videoUrl?: string;
}

interface NFT {
  _id: string;
  tokenAddress: string;
  productId: string;
  active: string;
}

const ProductPage: React.FC = () => {
  const { productId } = useParams() as { productId: string };
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [activeNFTCount, setActiveNFTCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLParagraphElement | null>(null);
  

  useEffect(() => {
    if (productId) {
      axios.get(`http://localhost:4000/api/products/${productId}`)
        .then(response => {
          setProduct(response.data);
          setMainImage(response.data.imageUrl1);
        })
        .catch(error => {
          console.error('Error fetching product:', error);
        });

      axios.get(`http://localhost:4000/api/public/products/${productId}/nfts`)
        .then(response => {
          setNfts(response.data);
          // Count active NFTs
          const activeNFTs = response.data.filter((nft: NFT) => nft.active === 'yes');
          setActiveNFTCount(activeNFTs.length);
        })
        .catch(error => {
          console.error('Error fetching NFTs:', error);
        });
    }
  }, [productId]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const dropdownElement = dropdownRef.current;
      const triggerElement = triggerRef.current;
      if (
        (triggerElement && triggerElement.contains(event.target as Node)) ||
        (dropdownElement && dropdownElement.contains(event.target as Node))
      ) {
        return;
      }
      setShowDropdown(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-black p-4">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[500px] w-[500px] rounded-xl dark:bg-gray-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] dark:bg-gray-800" />
            <Skeleton className="h-4 w-[200px] dark:bg-gray-800" />
            <Skeleton className="h-4 w-[300px] dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  const trimmedCollectionAddress = `${product.collectionAddress.slice(0, 6)}...${product.collectionAddress.slice(-4)}`;
  const imageUrls = [product.imageUrl1, product.imageUrl2, product.imageUrl3, product.imageUrl4, product.imageUrl5].filter(url => url) as string[];

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
    setMainImage(imageUrls[index]);
  };

  const handlePreviousImage = () => {
    const previousIndex = (currentImageIndex === 0) ? imageUrls.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(previousIndex);
    setMainImage(imageUrls[previousIndex]);
  };

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex === imageUrls.length - 1) ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(nextIndex);
    setMainImage(imageUrls[nextIndex]);
  };

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

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
      <Card className="flex flex-col md:flex-row p-8 border rounded-lg shadow-lg bg-white dark:bg-gray-900 dark:border-gray-700 w-full max-w-5xl">
        <div className="w-full md:w-1/2 pr-8">
          <div className="relative">
            {mainImage && (
              <Image 
                src={mainImage} 
                alt={product?.name || 'Product Image'} 
                width={800} 
                height={800} 
                className="object-contain rounded-lg mb-4"
                loading="lazy"
              />
            )}
            <button 
              onClick={handlePreviousImage}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded-full"
            >
              &larr;
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded-full"
            >
              &rarr;
            </button>
          </div>
          <div className="flex space-x-2 mt-4">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className={`cursor-pointer border-2 rounded-md ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => handleThumbnailClick(index)}
                style={{ flex: '0 0 auto' }}
              >
                <Image 
                  src={url} 
                  alt={`${product?.name}-${index}`} 
                  width={100} 
                  height={100} 
                  className="object-contain rounded-md"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2 pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">{product?.name}</h1>
          <p className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400">${product?.price}</p>
          <p className="text-md mb-4 text-gray-800 dark:text-gray-200">{product?.description}</p>
          <p className="text-md text-gray-800 dark:text-gray-200">
            <strong>Collection Address:</strong> 
            <Link href={`https://solscan.io/address/${product?.collectionAddress}`} target="_blank" className="text-blue-500 hover:underline ml-2">
              {trimmedCollectionAddress}
            </Link>
          </p>
          <p className="text-md text-gray-800 dark:text-gray-200">
            <strong>Designer:</strong> 
            <Link href={`/discover/designers/${product?.designerId}`} className="text-gray-600 dark:text-gray-400 hover:underline ml-2">
              {product?.username}
            </Link>
          </p>
          <div 
  className="relative inline-block"
  ref={triggerRef}
>
  <p className="text-md text-gray-800 dark:text-gray-200 cursor-pointer" onClick={toggleDropdown}>
    <strong>NFTs for Sale:</strong> {activeNFTCount}
  </p>
  {showDropdown && activeNFTCount > 0 && (
    <div 
      className="absolute bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-4 mt-2 w-64 z-10"
      ref={dropdownRef}
    >
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Available NFTs:</h2>
      <ul className="list-disc pl-5">
        {nfts
          .filter(nft => nft.active === 'yes')
          .map(nft => (
            <li key={nft._id} className="flex justify-between items-center text-gray-600 dark:text-gray-400 mb-2">
              <Link href={`/marketplace/${nft._id}`} className="hover:underline">
                {nft._id.slice(0, 6)}...{nft._id.slice(-4)}
              </Link>
              <Link 
                href={`/marketplace/${nft._id}`} 
                className="px-2 py-1 rounded transition ml-2 bg-buttonBackground text-buttonText hover:bg-buttonHover"
              >
                Buy
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )}
</div>
          
{activeNFTCount > 0 ? (
  <Link href={`/marketplace/${nfts.find(nft => nft.active === 'yes')?._id}`} className="w-full mt-4 inline-block text-center">
    <span className="bg-buttonBackground text-buttonText px-4 py-2 rounded hover:bg-buttonHover transition">
      Buy
    </span>
  </Link>
) : (
  <button className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
    Request
  </button>
)}

        </div>
      </Card>
    </div>
  );
  
};

export default ProductPage;
