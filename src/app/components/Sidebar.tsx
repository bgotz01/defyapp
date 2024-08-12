// src/app/components/Sidebar.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext'; // Import the user context

const Sidebar = () => {
  const [studioOpen, setStudioOpen] = useState(false);
  const [nftsOpen, setNftsOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  const { user, isDesigner } = useUser(); // Get user data and role check

  const toggleDropdown = (section: 'studio' | 'nfts' | 'discover') => {
    if (section === 'studio') {
      setStudioOpen(!studioOpen);
    } else if (section === 'nfts') {
      setNftsOpen(!nftsOpen);
    } else if (section === 'discover') {
      setDiscoverOpen(!discoverOpen);
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-0 group-hover:w-64 transition-all duration-300 ease-in-out bg-[rgb(246,241,235)] text-black z-40 overflow-y-auto pt-10">
      <div className="p-4 space-y-4">
        {/* DEFY Logo or Text */}
        <div className="mb-8">
          <Link href="/" className="text-3xl font-bold text-center block hover:underline">
            DEFY
          </Link>
        </div>

        {/* Greeting Section */}
        <div className="mb-4">
          <h2 className="font-bold mb-2">Hi, {user?.username || 'Guest'}</h2>
        </div>

        {/* User Section */}
        <div className="mb-4">
          <h2 className="font-bold mb-2">Profile</h2>
          <ul className="space-y-2">
            <li><Link href="/dashboard" className="hover:underline">Profile</Link></li>
          </ul>
        </div>
        <hr className="border-gray-400 mb-4" />

        {/* Studio Section (Visible only for designers) */}
        {user && isDesigner() && (
          <div className="mb-4">
            <h2 className="font-bold mb-2 cursor-pointer" onClick={() => toggleDropdown('studio')}>
              Studio
            </h2>
            {studioOpen && (
              <ul className="space-y-2 pl-4">
                <li><Link href="/studio/collections" className="hover:underline">Collections</Link></li>
                <li><Link href="/studio/upload" className="hover:underline">Upload</Link></li>
                <li><Link href="/studio/mint" className="hover:underline">Mint Products</Link></li>
                <li><Link href="/studio/mintcollection" className="hover:underline">Mint Collection</Link></li>
              </ul>
            )}
          </div>
        )}
        <hr className="border-gray-400 mb-4" />

        {/* NFTs Section (Visible for all users) */}
        <div className="mb-4">
          <h2 className="font-bold mb-2 cursor-pointer" onClick={() => toggleDropdown('nfts')}>
            NFTs
          </h2>
          {nftsOpen && (
            <ul className="space-y-2 pl-4">
              <li><Link href="/studio/mynft" className="hover:underline">My NFTs</Link></li>
              <li><Link href="/studio/mylistednft" className="hover:underline">My Listed NFTs</Link></li>
            </ul>
          )}
        </div>
        <hr className="border-gray-400 mb-4" />

        {/* Discover Section */}
        <div className="mb-4">
          <h2 className="font-bold mb-2 cursor-pointer" onClick={() => toggleDropdown('discover')}>
            Discover
          </h2>
          {discoverOpen && (
            <ul className="space-y-2 pl-4">
              <li><Link href="/discover/collections" className="hover:underline">Collections</Link></li>
              <li><Link href="/discover/categories" className="hover:underline">Categories</Link></li>
              <li><Link href="/discover/designers" className="hover:underline">Designers</Link></li>
              <li><Link href="/discover/products" className="hover:underline">Products</Link></li>
            </ul>
          )}
        </div>
        <hr className="border-gray-400 mb-4" />

        {/* Closet Section */}
        <div className="mb-4">
          <h2 className="font-bold mb-2">Closet</h2>
          <ul className="space-y-2">
            <li><Link href="/discover/closet" className="hover:underline">Closet</Link></li>
          </ul>
        </div>
        <hr className="border-gray-400 mb-4" />

        {/* Whitepaper Section */}
        <div className="mb-4">
          <h2 className="font-bold mb-2">Whitepaper</h2>
          <ul className="space-y-2">
            <li><Link href="/whitepaper" className="hover:underline">Whitepaper</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
