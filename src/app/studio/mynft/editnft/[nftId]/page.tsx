//src/app/studio/editnft/[nftId]/page.tsx


'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Product {
  _id: string;
  name: string;
}

interface NFT {
  _id: string; // This is the token address
  walletAddress: string;
  designerId: string;
  username: string;
  productId: string | null;
  active: string;
}

const EditNFTPage: React.FC = () => {
  const { nftId } = useParams() as { nftId: string };
  const router = useRouter();
  const [nft, setNft] = useState<NFT | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [active, setActive] = useState<string>('no');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const token = localStorage.getItem('token');
        const nftsResponse = await axios.get('http://localhost:4000/api/nfts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const foundNFT = nftsResponse.data.find((nft: NFT) => nft._id === nftId);
        if (foundNFT) {
          setNft(foundNFT);
          setSelectedProductId(foundNFT.productId || '');
          setActive(foundNFT.active);
        } else {
          setError('NFT not found');
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError('Failed to fetch NFTs');
      }
    };

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const productsResponse = await axios.get('http://localhost:4000/api/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      }
    };

    fetchNFTs();
    fetchProducts();
  }, [nftId]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
  
    try {
      const response = await axios.put(
        `http://localhost:4000/api/updateNFT`,
        { tokenAddress: nft?._id, productId: selectedProductId, active },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.success) {
        setSuccess('NFT updated successfully');
        router.refresh();
      } else {
        setError('Failed to update NFT');
      }
    } catch (error) {
      console.error('Error updating NFT:', error);
      setError('Error updating NFT');
    }
  };

  if (!nft || !products.length) {
    return <div>Loading...</div>;
  }

  // Find the name of the selected product
  const selectedProduct = products.find(product => product._id === nft.productId);
  const selectedProductName = selectedProduct ? selectedProduct.name : 'None';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg mb-8">
        <Button onClick={() => router.back()} className="mb-4">
          Back to NFTs
        </Button>
        <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">Edit NFT</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Token Address</label>
            <p className="text-gray-700 dark:text-gray-300">{nft._id}</p> {/* Display the _id field as the token address */}
            <hr className="border-gray-300 dark:border-gray-600 my-2" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Current Product ID: {nft.productId || 'None'}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Current Product Name: {selectedProductName}
            </p>
            <hr className="border-gray-300 dark:border-gray-600 my-2" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Active</label>
            <select
              value={active}
              onChange={(e) => setActive(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <hr className="border-gray-300 dark:border-gray-600 my-2" />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>
        <Button onClick={() => router.push('/studio/mylistednft')} className="mt-4">
          Go to My Listed NFTs
        </Button>
      </div>
    </div>
  );
};

export default EditNFTPage;
