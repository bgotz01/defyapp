// src/app/studio/mynft/[assetId]/page.tsx


"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAsset } from "@/utils/getToken";
import Card from "@/components/Card";
import Skeleton from "@/components/Skeleton";
import Image from "next/image";
import Link from "next/link";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listNFT } from "@/utils/nftMarket";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useTheme } from '@/contexts/ThemeContext';
import axios from 'axios';

interface Product {
  name: string;
  imageURI: string;
  groupAddress: string;
}

const ProductPage: React.FC = () => {
  const { assetId } = useParams() as { assetId: string };
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const router = useRouter();
  const { theme } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [isListed, setIsListed] = useState<boolean>(false);
  const [inDatabase, setInDatabase] = useState<boolean>(false);
  const [nftActive, setNftActive] = useState<boolean>(false);

  useEffect(() => {
    if (assetId) {
      const fetchProductDetails = async () => {
        try {
          const details = await getAsset(assetId);
          setProduct({
            name: details.name,
            imageURI: details.imageURI,
            groupAddress: details.groupAddress,
          });
          setMainImage(details.imageURI);
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      };

      fetchProductDetails();
    }
  }, [assetId]);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/public/nfts');
        const nft = response.data.find((nft: any) => nft._id === assetId);
        setInDatabase(!!nft);
        setNftActive(nft ? nft.active === 'yes' : false);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    };

    fetchNFTs();
  }, [assetId]);

  const onList = useCallback(async () => {
    if (!publicKey) {
      console.error("Connect the wallet");
      alert("Connect the Wallet!");
      return;
    }

    const provider = new AnchorProvider(connection, wallet as Wallet, {});

    const mint = new PublicKey(assetId);

    const nftAccount = await getAssociatedTokenAddress(
      mint, publicKey, false, TOKEN_2022_PROGRAM_ID
    );

    console.log("NFT associated account", nftAccount.toBase58());
    try {
      await listNFT(
        publicKey,
        nftAccount,
        mint,
        price,
        connection,
        sendTransaction,
        wallet,
        provider
      );
      setIsListed(true); // Set the listing status to true
    } catch (error) {
      console.log(error);
    }
  }, [publicKey, connection, sendTransaction, price, assetId, wallet]);

  const addToDatabase = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to add this NFT to the database.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:4000/api/saveNFT',
        { tokenAddress: assetId, walletAddress: publicKey?.toBase58() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setInDatabase(true);
        setNftActive(false);
        alert('NFT added to the database.');
      } else {
        alert('Failed to add NFT to the database.');
      }
    } catch (error) {
      console.error('Error adding NFT to the database:', error);
      alert('Error adding NFT to the database. Please try again.');
    }
  }, [assetId, publicKey]);

  if (!product) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${theme === 'light' ? 'bg-bglight' : 'bg-bgdark'} p-4`}>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[500px] w-[500px] rounded-xl dark:bg-gray-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] dark:bg-gray-800" />
            <Skeleton className="h-4 w-[200px] dark:bg-gray-800" />
            <Skeleton className="h-4 w-[300px] dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-bglight' : 'bg-bgdark'} p-4`}>
      <Card className={`flex flex-col items-center p-8 border rounded-lg shadow-lg w-full max-w-2xl ${theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-900 border-gray-700'}`}>
        <button
          className="self-start mb-4 text-blue-500 hover:underline"
          onClick={() => router.back()}
        >
          Back to My NFTs
        </button>
        <div className="w-full flex flex-col items-center">
          {mainImage && (
            <Image
              src={mainImage}
              alt={product.name}
              width={400}
              height={400}
              className="object-contain rounded-lg mb-4"
              loading="lazy"
            />
          )}
          <h1 className={`text-3xl font-bold mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
            {product.name}
          </h1>
          <p className={`text-md ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
            <strong>Token Address:</strong> {assetId}
          </p>
          <p className={`text-md ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
            <strong>Group Address:</strong>
            <Link
              href={`https://solscan.io/address/${product.groupAddress}`}
              target="_blank"
              className="text-blue-500 hover:underline ml-2"
            >
              {product.groupAddress}
            </Link>
          </p>
          <p className={`text-md ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
            <strong>In Database?</strong> {inDatabase ? 'Yes' : 'No'}
          </p>
          <p className={`text-md ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
            <strong>Active:</strong> {nftActive ? 'Yes' : 'No'}
          </p>
          {!inDatabase && (
            <Button
              className="w-full h-12 text-xl bg-buttonBackground text-white hover:bg-buttonHover mt-4"
              onClick={addToDatabase}
            >
              Add to DB
            </Button>
          )}
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            placeholder="price"
            required
            className={`mt-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          />
          <Button
            className="w-full h-12 text-xl bg-buttonBackground text-white hover:bg-buttonHover mt-6"
            onClick={onList}
            disabled={!inDatabase} // Disable listing button if not in the database
          >
            List for sale
          </Button>
          {isListed && (
            <div className="mt-4 text-center">
              <p className="text-green-500 font-bold">NFT is listed!</p>
              <Link href="/studio/mylistednft" className="text-blue-500 hover:underline">
                Go to My Listed NFTs
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProductPage;
