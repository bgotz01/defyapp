//src/app/studio/mylistednft/page.tsx


"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt, FaCheck, FaEdit } from "react-icons/fa";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import Skeleton from "@/components/Skeleton";
import { getNFTDetail, getNFTList } from "@/utils/nftMarket";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";

export interface NFTDetail {
  name: string;
  symbol: string;
  image?: string;
  group?: string;
  mint: string;
  seller: string;
  price: string;
  listing: string;
  active?: string; 
  jsonUrl?: string; 
  designer?: string; 
}

const trimAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`;

const MyListedNFTs: React.FC = () => {
  const { publicKey } = useWallet();
  const [assets, setAssets] = useState<NFTDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (publicKey) {
      fetchNFTs();
    }
  }, [publicKey, wallet]);

  const fetchNFTs = async () => {
    setIsLoading(true);
    const provider = new AnchorProvider(connection, wallet as Wallet, {});

    try {
      const listings = await getNFTList(provider, connection);
      const promises = listings
        .filter((list) => list.isActive && list.seller === publicKey?.toBase58())
        .map((list) => {
          const mint = new PublicKey(list.mint);
          return getNFTDetail(
            mint,
            connection,
            list.seller,
            list.price,
            list.pubkey
          );
        });

      const detailedListings = await Promise.all(promises);

      // Fetch all NFTs and then filter the specific ones based on the mint addresses
      const nftResponse = await axios.get('http://localhost:4000/api/public/nfts');
      const allNfts = nftResponse.data;

      const nftDetails = detailedListings.map(nft => {
        const foundNft = allNfts.find((item: any) => item._id === nft.mint);
        if (foundNft) {
          return { ...nft, active: foundNft.active || 'no', designer: foundNft.username || 'Unknown' };
        }
        return { ...nft, active: 'no' };
      });

      setAssets(nftDetails);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      setError("Failed to fetch NFTs.");
    } finally {
      setIsLoading(false);
    }
  };

  const activateNFT = async (tokenAddress: string, currentState: string) => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.put(
        "http://localhost:4000/api/updateNFT", 
        { tokenAddress, active: currentState === 'yes' ? 'no' : 'yes' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.mint === tokenAddress ? { ...asset, active: response.data.nft.active } : asset
          )
        );
      } else {
        setError("Failed to update NFT active status.");
      }
    } catch (error) {
      console.error("Error activating NFT:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to activate NFT.");
      } else {
        setError("Failed to activate NFT.");
      }
    }
  };
  
  return (
    <div className="p-4 pt-20 bg-bglight dark:bg-bgdark min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-textlight dark:text-textdark">
        My Listed NFTs
      </h1>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-center mb-4">
          {error}
        </div>
      )}

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
              className="relative p-4 rounded shadow hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer bg-productContainerLight dark:bg-productContainerDark group"
            >
              <div className="absolute top-4 right-4 z-10 space-y-2">
                <button
                  className={`text-sm px-3 py-1 rounded ${
                    asset.active === "yes" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                  onClick={() => activateNFT(asset.mint, asset.active || 'no')}
                >
                  {asset.active === "yes" ? (
                    <>
                      <FaCheck className="inline-block mr-2" />
                      Deactivate
                    </>
                  ) : (
                    "Activate"
                  )}
                </button>
                <Link href={`/studio/mynft/editnft/${asset.mint}`} prefetch={true}>
                  <button className="text-sm px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white">
                    <FaEdit className="inline-block mr-2" />
                    Edit
                  </button>
                </Link>
              </div>
              <Link href={`/marketplace/${asset.mint}`}>
                <div className="relative h-64 w-full mb-4">
                  {asset.image ? (
                    <Image
                      src={asset.image}
                      alt={`Asset ${asset.mint}`}
                      layout="fill"
                      objectFit="contain"
                      className="rounded"
                    />
                  ) : (
                    <p>No Image Available</p>
                  )}
                </div>
              </Link>
              <div className="flex flex-col items-center">
                <p className="font-semibold mb-2  text-textlight dark:text-textdark">
                  {asset.name || "Unknown"}
                </p>
                <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                  {Math.floor(Number(asset.price) / 1000000)} USDC
                </p>
               
                {asset.designer && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Designer: {asset.designer}
                  </p>
                )}
                {asset.jsonUrl && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <a href={asset.jsonUrl} target="_blank" rel="noopener noreferrer">
                      JSON URL
                    </a>
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Active: {asset.active === 'yes' ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity flex flex-col justify-end items-center opacity-0 group-hover:opacity-100 text-white text-xs p-2">
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
                  className="hover:text-gray-300 flex items-center text-xs mt-1"
                >
                  Seller: {trimAddress(asset.seller)}{" "}
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

export default MyListedNFTs;
