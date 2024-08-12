// src/app/discover/search/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Filters from '@/app/components/Filters';
import axios from 'axios';
import { useTheme } from '@/contexts/ThemeContext';

const SearchPage: React.FC = () => {
  const [products, setProducts] = useState([]);
  const { theme } = useTheme();

  const fetchProducts = async (filters = {}) => {
    try {
      const response = await axios.get('/api/products', { params: filters });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilter = (filters: { category: string; designer: string; minPrice: number; maxPrice: number }) => {
    fetchProducts(filters);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'light' ? 'bg-bglight text-textlight' : 'bg-bgdark text-textdark'} p-4`}>
      <h1 className="text-4xl font-bold mb-8">Search Products</h1>
      <Filters onFilter={handleFilter} />
      <div className="products grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {products.map((product: any) => (
          <div key={product._id} className="product border rounded-md p-4 bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{product.name}</h2>
            <p className="text-gray-800 dark:text-gray-200">Price: ${product.price}</p>
            <p className="text-gray-800 dark:text-gray-200">Designer: {product.username}</p>
            <p className="text-gray-800 dark:text-gray-200">Category: {product.category}</p>
            {/* Add more product details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
