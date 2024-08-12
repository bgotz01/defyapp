//src/app/discover/categories/page.tsx

'use client';

import React from 'react';
import CategoryWomen from '@/app/components/CategoryWomen';
import { useTheme } from '@/contexts/ThemeContext';

const CategoriesPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'light' ? 'bg-bglight text-textlight' : 'bg-bgdark text-textdark'} p-4`}>
      <h1 className="text-4xl font-bold mb-8">Discover Categories</h1>
      <CategoryWomen />
    </div>
  );
};

export default CategoriesPage;
