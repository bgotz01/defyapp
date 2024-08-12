// src/app/components/ImageSkeleton.tsx

import React from 'react';

interface ImageSkeletonProps {
  width: number;
  height: number;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ width, height }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md`}
      style={{ width, height }}
    ></div>
  );
};

export default ImageSkeleton;
