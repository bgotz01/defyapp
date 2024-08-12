// src/app/components/Skeleton.tsx

import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`bg-gray-300 dark:bg-gray-500 animate-pulse ${className}`}></div>;
};

export default Skeleton;
