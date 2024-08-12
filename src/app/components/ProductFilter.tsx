//src/app/components/ProductFilter.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ProductFilterProps {
  onFilter: (filters: { 
    category?: string; 
    designer?: string; 
    username?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    color?: string; 
    size?: string; 
    hasNFTsForSale?: boolean 
  }) => void;
  onReset: () => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilter, onReset }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [designers, setDesigners] = useState<{ name: string }[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDesigner, setSelectedDesigner] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [hasNFTsForSale, setHasNFTsForSale] = useState<boolean>(false);

  const colorOptions = [
    "Black", "Brown", "Purple", "White", "Beige/Natural", 
    "Blue", "Pink", "Red", "Green", "Grey", "Yellow"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const designersResponse = await axios.get('http://localhost:4000/api/designers');
        console.log('Fetched Designers:', designersResponse.data);
        // Normalize the data to use a consistent field name, either 'username' or 'designer'
        const normalizedDesigners = designersResponse.data.map((designer: any) => ({
          name: designer.username || designer.designer
        }));
        setDesigners(normalizedDesigners);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFilter = () => {
    const filters: { 
      category?: string; 
      username?: string; 
      designer?: string; 
      minPrice?: number; 
      maxPrice?: number; 
      color?: string; 
      size?: string; 
      hasNFTsForSale?: boolean 
    } = {};

    if (selectedCategory) filters.category = selectedCategory;
    if (selectedDesigner) {
      filters.username = selectedDesigner;
      filters.designer = selectedDesigner;
    }
    if (selectedColor) filters.color = selectedColor;
    if (selectedSize) filters.size = selectedSize;

    const minPriceNumber = parseFloat(minPrice);
    const maxPriceNumber = parseFloat(maxPrice);

    if (!isNaN(minPriceNumber)) filters.minPrice = minPriceNumber;
    if (!isNaN(maxPriceNumber)) filters.maxPrice = maxPriceNumber;

    filters.hasNFTsForSale = hasNFTsForSale;

    onFilter(filters);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedDesigner('');
    setSelectedColor('');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setHasNFTsForSale(false);
    onReset();
  };

  return (
    <div className="filter-component mb-8 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-7xl">
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="mb-4 md:mb-0">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 md:mb-0">
          <label htmlFor="designer" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Designer
          </label>
          <select
            id="designer"
            value={selectedDesigner}
            onChange={(e) => setSelectedDesigner(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Designers</option>
            {designers.map((designer) => (
              <option key={designer.name} value={designer.name}>
                {designer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 md:mb-0">
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Color
          </label>
          <select
            id="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Colors</option>
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 md:mb-0">
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Size
          </label>
          <select
            id="size"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Sizes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 md:mb-0">
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Min Price (USDC)
          </label>
          <input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div className="mb-4 md:mb-0">
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Max Price (USDC)
          </label>
          <input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>

        <div className="mb-4 md:mb-0">
          <label htmlFor="hasNFTsForSale" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            NFTs for Sale
          </label>
          <input
            id="hasNFTsForSale"
            type="checkbox"
            checked={hasNFTsForSale}
            onChange={(e) => setHasNFTsForSale(e.target.checked)}
            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="mt-4 md:mt-0 flex space-x-2">
        <button
          onClick={handleFilter}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilter;
