// src/app/studio/components/ListNFTComponent.tsx

import React, { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { listNFT } from '@/utils/nftMarket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ListNFTComponentProps {
  mintAddress: string;
}

const ListNFTComponent: React.FC<ListNFTComponentProps> = ({ mintAddress }) => {
  const [price, setPrice] = useState<number>(0);
  const [listingSuccess, setListingSuccess] = useState<boolean>(false);  // State to track success
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const wallet = useWallet();

  const onList = useCallback(async () => {
    if (!publicKey) {
      console.error("Connect the wallet");
      alert("Connect the Wallet!");
      return;
    }

    const provider = new AnchorProvider(connection, wallet as unknown as Wallet, {});

    const mint = new PublicKey(mintAddress);

    const nftAccount = await getAssociatedTokenAddress(
      mint,
      publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
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
        wallet as unknown as Wallet,
        provider
      );
      setListingSuccess(true);  // Set success state to true
    } catch (error) {
      console.log(error);
    }
  }, [publicKey, connection, sendTransaction, price, mintAddress, wallet]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {!listingSuccess ? (
        <>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            placeholder="Price in USDC"
            required
            className="mt-4"
          />
          <Button
            className="w-full h-12 text-xl bg-blue-400 text-white hover:bg-blue-500 mt-6"
            onClick={onList}
          >
            List for sale
          </Button>
        </>
      ) : (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-green-500">NFT Listed Successfully!</h3>
          <Link href="/studio/mylistednft" className="text-blue-500 hover:text-blue-700 mt-4 block">
            View My Listed NFTs
          </Link>
        </div>
      )}
    </div>
  );
};

export default ListNFTComponent;
