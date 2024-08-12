"use client"; 

import React from 'react';
import UserProducts from '../components/UserProducts';

const UserProductsPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">My Products</h2>
        <UserProducts />
      </div>
    </div>
  );
};

export default UserProductsPage;
