// src/app/components/Filter.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface FilterProps {
  onFilter: (filters: { category?: string; designer?: string; minPrice?: number; maxPrice?: number }) => void;
  onReset: () => void;  // New prop for reset
  category: string;
}

const Filter: React.FC<FilterProps> = ({ onFilter, onReset, category }) => {
  const [designers, setDesigners] = useState<{ username: string }[]>([]);
  const [selectedDesigner, setSelectedDesigner] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/designers');
        setDesigners(response.data);
      } catch (error) {
        console.error('Error fetching designers:', error);
      }
    };

    fetchDesigners();
  }, []);

  const handleFilter = () => {
    const filters: { category?: string; designer?: string; minPrice?: number; maxPrice?: number } = { category };

    if (selectedDesigner) {
      filters.designer = selectedDesigner;
    }

    const minPriceNumber = parseFloat(minPrice);
    const maxPriceNumber = parseFloat(maxPrice);

    if (!isNaN(minPriceNumber)) filters.minPrice = minPriceNumber * 1_000_000;
    if (!isNaN(maxPriceNumber)) filters.maxPrice = maxPriceNumber * 1_000_000;
    
    onFilter(filters);
  };

  const handleReset = () => {
    setSelectedDesigner(''); // Reset designer dropdown to "All Designers"
    setMinPrice('');        // Clear min price
    setMaxPrice('');        // Clear max price
    onReset();              // Notify parent component to reset filters
  };

  return (
    <div className="filter-component mb-8 flex flex-col md:flex-row md:items-center md:justify-between w-full max-w-7xl">
      <div className="flex flex-col md:flex-row md:space-x-4">
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
              <option key={designer.username} value={designer.username}>
                {designer.username}
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
      </div>
      <div className="mt-4 md:mt-0 flex space-x-2">
        <button
          onClick={handleFilter}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset} // Call the reset function
          className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default Filter;
