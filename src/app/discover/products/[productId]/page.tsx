// src/app/discover/products/[productId]/page.tsx


'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Skeleton from '@/components/Skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from "lucide-react"

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
}

const ProductPage: React.FC = () => {
  const { productId } = useParams() as { productId: string };
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

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
  
      axios.get(`http://localhost:4000/api/nfts/count/${productId}`)
        .then(response => {
          setNfts(new Array(response.data.count).fill({ tokenAddress: 'Placeholder' })); // Assuming you replace 'Placeholder' with actual data
        })
        .catch(error => {
          console.error('Error fetching NFTs:', error);
        });
    }
  }, [productId]);

  
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

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
                alt={product.name} 
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
                  alt={`${product.name}-${index}`} 
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
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">{product.name}</h1>
          <p className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400">${product.price}</p>
          <p className="text-md mb-4 text-gray-800 dark:text-gray-200">{product.description}</p>
          <p className="text-md text-gray-800 dark:text-gray-200">
            <strong>Collection Address:</strong> 
            <Link 
              href={`https://solscan.io/address/${product.collectionAddress}`} 
              target="_blank" 
              className="hover:underline ml-2 inline-flex items-center text-gray-800 dark:text-gray-200"
            >
              {trimmedCollectionAddress}
              <ExternalLink className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
          <p className="text-md text-gray-800 dark:text-gray-200">
            <strong>Designer:</strong> 
            <Link href={`/discover/designers/${product.designerId}`} className="text-gray-600 dark:text-gray-400 hover:underline ml-2">
              {product.username}
            </Link>
          </p>
          <div className="relative inline-block">
  <p 
    className="text-md text-gray-800 dark:text-gray-200 cursor-pointer"
    onClick={toggleDropdown} // Toggle on click instead of hover
  >
    <strong>NFTs for Sale:</strong> {nfts.length}
  </p>
  {showDropdown && nfts.length > 0 && (
    <div 
      className="absolute bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-4 mt-2 w-64 z-10"
      ref={dropdownRef}
    >
      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Available NFTs:</h2>
      <ul className="list-disc pl-5">
        {nfts.map((nft, index) => (
          <li key={index} className="text-gray-600 dark:text-gray-400">
            <Link href={`/marketplace/${nft.tokenAddress}`} className="text-gray-600 dark:text-gray-400 hover:underline">
              {nft.tokenAddress}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
          {product.videoUrl && (
            <p className="text-md text-gray-800 dark:text-gray-200">
              <strong>Watch Video:</strong> 
              <a href={product.videoUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:underline ml-2">
                View Video
              </a>
            </p>
          )}
          {/* The Buy button placed below the product details */}
          {nfts.length > 0 ? (
            <Link href={`/marketplace/${nfts[0]._id}`} className="w-full mt-4 inline-block text-center">
              <span className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
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
