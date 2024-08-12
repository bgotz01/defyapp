import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { name: 'Dresses', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Dresses.png', link: '/discover/categories/dresses' },
  { name: 'Jackets', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Jacket.png', link: '/discover/categories/jackets' },
  { name: 'Shorts', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Shorts.png', link: '/discover/categories/shorts' },
  { name: 'Swimwear', image: 'https://nftcollectionuploads.s3.us-east-1.amazonaws.com/66a758ff8486f5d7f7bec445/Women_Swimwear.png', link: '/discover/categories/swimwear' },
];

const SimpleCategoryComponent: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {categories.map((category) => (
        <Link key={category.name} href={category.link}>
          <div className="cursor-pointer p-2 border rounded-md border-gray-300">
            <Image
              src={category.image}
              alt={category.name}
              width={250}
              height={250}
              className="object-cover rounded-md"
              loading="lazy"
            />
            <p className="text-center mt-2 text-gray-800 dark:text-gray-200">{category.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SimpleCategoryComponent;
