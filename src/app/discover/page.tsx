// src/app/discover/page.tsx
'use client';

import React from 'react';
import FeaturedCollections from '../components/FeaturedCollections';
import TrendingCollections from '../components/TrendingCollections';

const DiscoverPage = () => {
  const featuredCollections = [
    'C9XC1GcJ2JWAesYCNyEc9DPi593b2nudnTrSpbg8qgAo',
    '3TzvHfyKY3JCxwdbpxHtePhv4VgycmHKaSt1zEv55Sh3'
  ];

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-black flex flex-col items-center">
      <div className="w-full max-w-7xl">
        <FeaturedCollections collectionAddresses={featuredCollections} />
        <TrendingCollections />
      </div>
    </div>
  );
};

export default DiscoverPage;
