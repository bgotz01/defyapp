import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageSkeleton from './ImageSkeleton';

interface WomenCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { name: 'Dresses', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Dresses.png', link: '/discover/categories/dresses' },
  { name: 'Jackets', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Jacket.png', link: '/discover/categories/jackets' },
  { name: 'Shorts', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Shorts.png', link: '/discover/categories/shorts' },
  { name: 'Swimwear', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Swimwear.png', link: '/discover/categories/swimwear' },
  // Add more categories here as needed
];

const WomenCategories: React.FC<WomenCategoriesProps> = ({ selectedCategory, onSelectCategory }) => {
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({
    Dresses: true,
    Jackets: true,
    Shorts: true,
    Swimwear: true,
  });

  const handleImageLoad = (categoryName: string) => {
    console.log(`Image loaded: ${categoryName}`);
    setLoadingImages((prev) => ({ ...prev, [categoryName]: false }));
  };

  const handleImageError = (categoryName: string) => {
    console.error(`Image failed to load: ${categoryName}`);
    setLoadingImages((prev) => ({ ...prev, [categoryName]: false }));
  };

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {categories.map((category) => (
        <Link key={category.name} href={category.link}>
          <div
            className={`cursor-pointer p-2 border rounded-md ${selectedCategory === category.name ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => onSelectCategory(category.name)}
          >
            {loadingImages[category.name] && <ImageSkeleton width={250} height={250} />}
            <Image
              src={category.image}
              alt={category.name}
              width={250}
              height={250}
              className={`object-cover rounded-md ${loadingImages[category.name] ? 'hidden' : 'block'}`}
              onLoad={() => handleImageLoad(category.name)}
              onError={() => handleImageError(category.name)}
              loading="lazy"
            />
            <p className="text-center mt-2 text-gray-800 dark:text-gray-200">{category.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default WomenCategories;
