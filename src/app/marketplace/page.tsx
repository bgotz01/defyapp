//src/app/marketplace/page.tsx


"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import Skeleton from "@/components/Skeleton";
import { getNFTDetail, getNFTList } from "@/utils/nftMarket";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import Filter from "@/app/components/Filter";

export interface NFTDetail {
  name: string;
  symbol: string;
  image?: string;
  group?: string;
  mint: string;
  seller: string;
  price: string; // Assume price is in microUSDC
  listing: string;
  listed: string;
  jsonUrl?: string;
  designer?: string;
  designerId?: string;
  category?: string;
}

const trimAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

const Marketplace: React.FC = () => {
  const { publicKey } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [assets, setAssets] = useState<NFTDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const [filters, setFilters] = useState<{
    category?: string;
    designer?: string;
    minPrice?: number;
    maxPrice?: number;
  }>({
    category: '',
    designer: '',
    minPrice: 0,
    maxPrice: Infinity
  });

  // Array of NFTs to exclude
  const excludedNFTs = ["6cAHyqiW7rd3hiVZBU1f3GfsuNa4fmhr8gLKQQuN1kR4"];

  useEffect(() => {
    const storedWalletAddress = sessionStorage.getItem("walletAddress");
    const storedAssets = sessionStorage.getItem("assets");

    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }

    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
    fetchNFTs();
  }, []);

  useEffect(() => {
    fetchNFTs();
  }, [wallet, filters]);

  useEffect(() => {
    sessionStorage.setItem("walletAddress", walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    sessionStorage.setItem("assets", JSON.stringify(assets));
  }, [assets]);

  const fetchNFTs = async () => {
    setIsLoading(true);
    const provider = new AnchorProvider(connection, wallet as Wallet, {});

    try {
      const listings = await getNFTList(provider, connection);
      const promises = listings
        .filter((list) => list.isActive && !excludedNFTs.includes(list.mint))
        .map((list) => {
          const mint = new PublicKey(list.mint);
          return getNFTDetail(mint, connection, list.seller, list.price, list.pubkey);
        });

      const detailedListings = await Promise.all(promises);

      // Fetch all NFTs from the API
      const nftResponse = await axios.get('http://localhost:4000/api/public/nfts');
      const allNfts = nftResponse.data;

      const getDesignerField = (nftData: any): string => {
        return nftData.username || nftData.designer || 'Unknown';
      };

      const nftDetails = detailedListings.map(nft => {
        const normalizedMint = nft.mint.toLowerCase();
        const foundNft = allNfts.find((item: any) => item._id.toLowerCase() === normalizedMint);
        if (foundNft) {
          return {
            ...nft,
            designer: getDesignerField(foundNft),
            category: foundNft.category || 'Unknown'
          };
        }
        return { ...nft, designer: 'Unknown', category: 'Unknown' };
      });

      const minPrice = filters.minPrice ?? 0;
      const maxPrice = filters.maxPrice ?? Infinity;

      const filteredNFTs = nftDetails.filter(nft =>
        (filters.designer === '' || nft.designer === filters.designer) &&
        (parseFloat(nft.price) >= minPrice) &&
        (parseFloat(nft.price) <= maxPrice) &&
        (filters.category === '' || nft.category === filters.category)
      );

      setAssets(filteredNFTs);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      setError("Failed to fetch NFTs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters: {
    category?: string;
    designer?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    setFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      designer: '',
      minPrice: 0,
      maxPrice: Infinity
    });
    fetchNFTs();  // Refresh the NFTs list
  };

  return (
    <div className="p-4 pt-20 bg-bglight dark:bg-bgdark min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-textlight dark:text-textdark">
        NFTs on sale
      </h1>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-center mb-4">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <Filter 
        category={filters.category || ''} 
        onFilter={handleFilterChange} 
        onReset={handleResetFilters} // Pass reset function
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-64 w-full mb-4 dark:bg-gray-700" />
              <div className="flex flex-col items-center">
                <Skeleton className="h-6 w-3/4 mb-2 dark:bg-gray-700" />
                <Skeleton className="h-4 w-1/2 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset: NFTDetail) => (
            <div
              key={asset.mint}
              className="relative p-4 rounded-lg shadow hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer bg-productContainerLight dark:bg-productContainerDark group"
            >
              <Link href={`/marketplace/${asset.mint}`}>
                <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
                  {publicKey?.toBase58() === asset.seller ? (
                    <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-br-lg">
                      Own
                    </div>
                  ) : null}
                  {asset.image ? (
                    <Image
                      src={asset.image}
                      alt={`Asset ${asset.mint}`}
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg" // Rounded corners
                    />
                  ) : (
                    <p>No Image Available</p>
                  )}
                </div>
              </Link>
              <div className="flex flex-col items-center">
                <p className="font-medium mb-2 text-lg text-textlight dark:text-textdark">
                  {asset.name || "Unknown"}
                </p>
                <p className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                  {Math.floor(Number(asset.price) / 1_000_000)} USDC
                </p>
                
                {asset.designer && (
                  <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                    Designer: {asset.designer}
                  </p>
                )}
                {asset.jsonUrl && (
                  <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                    <a href={asset.jsonUrl} target="_blank" rel="noopener noreferrer">
                      JSON URL
                    </a>
                  </p>
                )}
              </div>
              <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex flex-col justify-start items-center opacity-0 group-hover:opacity-100 text-white text-xs p-2">
                <Link
                  href={`https://solana.fm/address/${asset.mint}`}
                  target="_blank"
                  className="hover:text-gray-300 flex items-center"
                >
                  Token: {trimAddress(asset.mint)}{" "}
                  <FaExternalLinkAlt className="ml-1" />
                </Link>
                {asset.group && (
                  <Link
                    href={`https://solana.fm/address/${asset.group}`}
                    target="_blank"
                    className="hover:text-gray-300 flex items-center"
                  >
                    Group: {trimAddress(asset.group)}{" "}
                    <FaExternalLinkAlt className="ml-1" />
                  </Link>
                )}
                <Link
                  href={`https://solana.fm/address/${asset.seller}`}
                  target="_blank"
                  className="hover:text-gray-300 flex items-center"
                >
                  Seller: {trimAddress(asset.seller)}
                  <FaExternalLinkAlt className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <h2 className="text-2xl font-bold mb-4 text-center text-red-500 dark:text-yellow">
          No NFTs on sale
        </h2>
      )}
    </div>
  );
};

export default Marketplace;
