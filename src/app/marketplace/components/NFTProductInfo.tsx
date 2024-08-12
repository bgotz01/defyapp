// src/app/marketplace/components/NFTProductInfo.tsx

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

interface NFT {
  _id: string;
  tokenAddress: string;
  walletAddress: string;
  designerId: string;
  username: string;
  productId: string;
  createdAt: string;
  __v: number;
}

interface Product {
  _id: string;
  name: string;
  gender: string;
  category: string;
  color: string[];
  description: string;
  price: number;
  collectionId: string;
  collectionAddress: string;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  imageUrl4: string;
  imageUrl5: string;
  jsonUrl: string;
  listed: boolean;
  designerId: string;
  username: string;
  __v: number;
}

interface NFTProductInfoProps {
  tokenAddress: string;
}

const NFTProductInfo: React.FC<NFTProductInfoProps> = ({ tokenAddress }) => {
  const [nft, setNFT] = useState<NFT | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNFTAndProduct = async () => {
      try {
        // Fetch NFT details
        const nftResponse = await fetch(`/api/public/nft/${tokenAddress}`);
        if (!nftResponse.ok) throw new Error("NFT not found");
        const nftData: NFT = await nftResponse.json();
        setNFT(nftData);

        // Fetch Product details using productId from NFT
        const productResponse = await fetch(`/api/public/product/${nftData.productId}`);
        if (!productResponse.ok) throw new Error("Product not found");
        const productData: Product = await productResponse.json();
        setProduct(productData);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchNFTAndProduct();
  }, [tokenAddress]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!nft || !product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 pt-20 bg-bglight dark:bg-bgdark min-h-screen">
      <button onClick={() => router.back()} className="mb-4 text-blue-500 hover:underline">Back</button>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">{product.name}</h1>
        <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">Designer: {product.username}</p>
        <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">Description: {product.description}</p>
        <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">Category: {product.category}</p>
        <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">Price: ${product.price}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[product.imageUrl1, product.imageUrl2, product.imageUrl3, product.imageUrl4, product.imageUrl5].map((imageUrl, index) => (
            imageUrl && <Image key={index} src={imageUrl} alt={`Product Image ${index + 1}`} width={300} height={300} className="rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const fetchNFTAndProduct = async (tokenAddress: string): Promise<{ nft: NFT; product: Product }> => {
  const nftResponse = await fetch(`/api/public/nft/${tokenAddress}`);
  if (!nftResponse.ok) throw new Error("NFT not found");
  const nft: NFT = await nftResponse.json();

  const productResponse = await fetch(`/api/public/product/${nft.productId}`);
  if (!productResponse.ok) throw new Error("Product not found");
  const product: Product = await productResponse.json();

  return { nft, product };
};

export default NFTProductInfo;
