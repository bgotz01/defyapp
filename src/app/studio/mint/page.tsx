// src/app/studio/mint/page.tsx

"use client";

import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { RequestAirdrop } from './components/RequestAirdrop';
import useUserSOLBalanceStore from './stores/useUserSOLBalanceStore';
import { TextInput } from './components/TextInput';
import { MintNFT as MintNFTComponent } from './components/MintNFT';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FiExternalLink, FiCopy } from 'react-icons/fi';
import ListNFTComponent from '../components/ListNFTComponent';
import { Button } from '@/components/ui/button';

const MintNFTPage: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const { user } = useUser();
    const { theme } = useTheme();
    const [name, setName] = useState<string>('');
    const [symbol, setSymbol] = useState<string>('');
    const [groupAddr, setGroupAddr] = useState<string>('');
    const [jsonURI, setJsonURI] = useState<string>('');
    const [productId, setProductId] = useState<string>('');
    const [products, setProducts] = useState<any[]>([]);
    const [productImages, setProductImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [nftId, setNftId] = useState<string | null>(null);
    const [mintAddress, setMintAddress] = useState<string | null>(null);

    const balance = useUserSOLBalanceStore((s) => s.balance);
    const { getUserSOLBalance } = useUserSOLBalanceStore();

    useEffect(() => {
        const fetchBalance = async () => {
            if (wallet.publicKey) {
                try {
                    console.log(wallet.publicKey.toBase58());
                    await getUserSOLBalance(wallet.publicKey, connection);
                } catch (error) {
                    console.error("Error getting balance:", error);
                }
            }
        };

        const fetchProducts = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const productsResponse = await fetch('http://localhost:4000/api/products', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!productsResponse.ok) {
                    setError('Failed to fetch products');
                    return;
                }

                const productsData = await productsResponse.json();
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError('Error fetching products');
            }
        };

        fetchBalance();
        fetchProducts();
    }, [wallet.publicKey, connection, getUserSOLBalance]);

    const handleSaveNFTDetails = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, please log in.');
            return;
        }
    
        if (!nftId) {
            console.error('No NFT ID found. Mint the NFT first.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:4000/api/updateNFT', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tokenAddress: nftId,
                    productId: productId,  // Ensure the productId is passed
                    active: 'no',           // Default value for active
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from server:', errorData);
                throw new Error(errorData.message || 'Failed to update NFT');
            }
    
            const data = await response.json();
            console.log('NFT updated successfully:', data);
            await fetchProductImages(productId); // Fetch product images after saving NFT details
        } catch (error) {
            console.error('Error updating NFT:', error);
            setError('Error updating NFT');
        }
    };
    
    

    const fetchProductImages = async (productId: string) => {
        try {
            const response = await fetch(`http://localhost:4000/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product images');
            }
            const product = await response.json();
            const images = [product.imageUrl1, product.imageUrl2, product.imageUrl3, product.imageUrl4, product.imageUrl5].filter(Boolean);
            setProductImages(images);
        } catch (error) {
            console.error('Error fetching product images:', error);
            setError('Error fetching product images');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className={`md:hero mx-auto p-4 ${theme === 'light' ? 'bg-bglight text-textlight' : 'bg-bgdark text-textdark'}`}>
            <div className="md:hero-content flex flex-col items-center">
                <div className='mt-6'>
                    <h1 className="text-center text-5xl font-bold mb-4">
                        NFT Mint
                    </h1>
                </div>
                <div className="flex flex-col mt-2 items-center">
                    <RequestAirdrop />
                    <h4 className="md:w-full text-2xl my-2 text-center">
                        {wallet &&
                            <div className="flex flex-row justify-center items-center">
                                <h1>Balance: </h1>
                                <div>
                                    {(balance || 0).toLocaleString()}
                                </div>
                                <div className="ml-2">
                                    SOL
                                </div>
                            </div>
                        }
                    </h4>
                </div>
                {error && <div className="text-red-500 mt-4">{error}</div>}

                <div className={`flex flex-col items-center space-y-4 p-4 rounded-lg mb-4 w-full max-w-xl ${theme === 'light' ? 'bg-productContainerLight' : 'bg-productContainerDark'}`}>
                    <h2 className="text-2xl font-bold mb-4">Step 1: Mint NFT</h2>
                    <TextInput label="Name" placeholder="Input the name" value={name} onChange={setName} />
                    <TextInput label="Symbol" placeholder="Input the Symbol" value={symbol} onChange={setSymbol} />
                    <TextInput label="Group Address" placeholder="Input the Group address" value={groupAddr} onChange={setGroupAddr} />
                    <TextInput label="JSON URI" placeholder="Input the Json URI" value={jsonURI} onChange={setJsonURI} />
                    
                    <MintNFTComponent name={name} symbol={symbol} groupAddr={groupAddr} jsonURI={jsonURI} onMint={(mintAddr, nftId) => { setMintAddress(mintAddr); setNftId(nftId); }} />
                </div>

                {mintAddress && (
                    <>
                        <div className={`flex flex-col items-center space-y-6 p-6 rounded-lg mb-8 w-full max-w-xl ${theme === 'light' ? 'bg-productContainerLight' : 'bg-productContainerDark'}`}>
  <h2 className="text-2xl font-bold mb-4">Step 2: Save NFT</h2>
  
  <div className={`w-full p-4 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-700'}`}>
    <div className="text-center mb-4">
      <h3 className="text-xl font-bold mb-2">NFT Minted Successfully!</h3>
      <div className="flex justify-center items-center space-x-2">
        <p className="font-mono text-sm">{mintAddress}</p>
        <button onClick={() => copyToClipboard(mintAddress)} className="text-blue-500 hover:text-blue-700">
          <FiCopy />
        </button>
        <a href={`https://solana.fm/address/${mintAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
          <FiExternalLink />
        </a>
      </div>
    </div>
  </div>
  
  <div className={`w-full p-4 rounded-lg border ${theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-700'}`}>
    <div className="w-full mb-4">
      <label className="block text-sm font-medium mb-2">Select Product</label>
      <select
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}`}
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      >
        <option value="" disabled>Select a product</option>
        {products.map((product) => (
          <option key={product._id} value={product._id}>{product.name}</option>
        ))}
      </select>
    </div>
    
    <Button onClick={handleSaveNFTDetails} className="mt-4 w-full px-4 py-2 rounded bg-buttonBackground hover:bg-buttonHover text-textdark">
      Save NFT
    </Button>
  </div>
</div>


                        {productImages.length > 0 && (
                            <div className={`flex flex-col items-center space-y-4 p-4 rounded-lg mb-4 w-full max-w-xl ${theme === 'light' ? 'bg-productContainerLight' : 'bg-productContainerDark'}`}>
                                <h2 className="text-2xl font-bold mb-4">Step 3: List NFT</h2>
                                <div className="mt-4">
                                    <h3 className="text-xl font-bold">Product Images</h3>
                                    <div className="flex flex-col items-center space-y-4">
                                        {productImages.map((url, index) => (
                                            <img key={index} src={url} alt={`Product image ${index + 1}`} className="w-full max-w-xs" />
                                        ))}
                                    </div>
                                    <ListNFTComponent mintAddress={mintAddress} />
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-4">
                    <Link href="/studio/account">
                        <span className="hover:text-blue-700">Go to Account Page</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MintNFTPage;
