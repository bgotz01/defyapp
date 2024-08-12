//src/app/discover/categories/dresses/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import Skeleton from '@/components/Skeleton';
import CategoryFilter from '@/app/components/CategoryFilter';
import Link from 'next/link';
import Card from '@/components/Card';

const capitalizeTitle = (title: string) => {
  return title
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const DressesPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme } = useTheme();

  const fetchProducts = async (filters: { category?: string, hasNFTsForSale?: boolean } = {}) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/public/products', { params: { category: 'Dresses', ...filters } });
      console.log('Fetched products:', response.data);

      const capitalizedProducts = await Promise.all(response.data.map(async (product: any) => {
        const nftCountResponse = await axios.get(`http://localhost:4000/api/nfts/count/${product._id}`);
        const nftCount = nftCountResponse.data.count || 0;

        if (filters.hasNFTsForSale && nftCount === 0) {
          return null;
        }

        return {
          ...product,
          name: capitalizeTitle(product.name),
          nftCount
        };
      }));

      const filteredProducts = capitalizedProducts.filter(product => product !== null);

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Initially fetch all products in the 'Dresses' category without any filters
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center ${theme === 'light' ? 'bg-bglight text-textlight' : 'bg-bgdark text-textdark'} p-4`}>
      <h1 className="text-4xl font-bold mb-8 text-center">Dresses</h1>
      <CategoryFilter 
        onFilter={fetchProducts} 
        onReset={() => fetchProducts()} 
        category="Dresses" 
      />
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8 max-w-7xl">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <Card>
                <Skeleton className="h-64 w-full mb-0" />
              </Card>
              <Card>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            </div>
          ))
        ) : (
          products.map((product: any) => (
            <div key={product._id} className="flex flex-col">
              <div className="relative h-80 overflow-hidden rounded-md">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30" 
                  style={{ backgroundImage: `url(/assets/soft-blur.jpg)` }}
                ></div>
                <Link href={`/discover/products/${product._id}`}>
                  <div className="relative h-full w-full">
                    <Image 
                      src={product.imageUrl1} 
                      alt={product.name} 
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md border-2 border-gray-300 dark:border-gray-700 transition-transform duration-300 ease-in-out hover:scale-105" 
                    />
                    {product.imageUrl2 && (
                      <Image 
                        src={product.imageUrl2} 
                        alt={product.name} 
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md border-2 border-gray-300 dark:border-gray-700 absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 ease-in-out" 
                      />
                    )}
                  </div>
                </Link>
                {product.nftCount > 0 && (
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-md shadow-md">
                    NFTs: {product.nftCount}
                  </div>
                )}
              </div>
              <Card className="bg-gray-100 dark:bg-gray-700 p-4 text-center rounded-t-none">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">${product.price}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <Link href={`/discover/designers/${product.designerId}`}>
                    Designer: {product.username}
                  </Link>
                </p>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DressesPage;
