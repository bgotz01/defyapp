// src/app/discover/categories/all/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

const categories = ['All', 'Dresses', 'Jackets', 'Shorts', 'Swimwear'];

const AllProductsPage: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { theme } = useTheme();

  const fetchProducts = async (category: string) => {
    try {
      const params = category !== 'All' ? { category } : {};
      const response = await axios.get('http://localhost:4000/api/public/products', { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className={`min-h-screen flex flex-col items-center ${theme === 'light' ? 'bg-bglight text-textlight' : 'bg-bgdark text-textdark'} p-4`}>
      <h1 className="text-4xl font-bold mb-8">All Products</h1>
      <div className="mb-8">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="products grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-7xl">
        {products.map((product: any) => (
          <Card key={product._id} className="flex flex-col items-center p-4 border rounded-md bg-white dark:bg-gray-900 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{product.name}</h2>
            <p className="text-gray-800 dark:text-gray-200">Price: ${product.price}</p>
            <p className="text-gray-800 dark:text-gray-200">Designer: {product.username}</p>
            <p className="text-gray-800 dark:text-gray-200">NFTs for Sale: {product.nftCount}</p>
            <Image
              src={product.imageUrl1}
              alt={product.name}
              width={300}
              height={400}
              className="object-cover rounded-md mt-2"
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllProductsPage;
