// src/app/studio/mint/components/MintCollection.tsx

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FC, useCallback, useState } from 'react';
import { createTokenAndMint, generateExplorerUrl, createTokenMetadata } from '../extension-nft/nftmintcollection'; // Updated import to use nftmintcollection
import { Keypair } from '@solana/web3.js';
import TransactionModal from './TransactionModal';
import CopyLink from './CopyLink';
import { useTheme } from '@/contexts/ThemeContext';

interface MetaDataType {
    name: string;
    symbol: string;
    jsonURI: string;
    onMint: (tokenAddress: string) => void;
}

export const MintCollection: FC<MetaDataType> = ({ name, symbol, jsonURI, onMint }) => {
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const { connection } = useConnection();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nftlink, setNftlink] = useState("");
    const [mintAddress, setMintAddress] = useState("");
    const { theme } = useTheme();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const onClick = useCallback(async () => {
        if (!publicKey) {
            console.error("Wallet not connected");
            return;
        }

        const mintKeyPair = Keypair.generate();
        const mint = mintKeyPair.publicKey;
        const authority = publicKey;
        const owner = publicKey;

        // Create token metadata without the group address
        const tokenMetadata = createTokenMetadata(publicKey, mint, name, symbol, jsonURI);

        try {
            const [initSig, mintSig] = await createTokenAndMint(publicKey, mint, authority, tokenMetadata, mintKeyPair, owner, sendTransaction, signTransaction, connection);

            console.log(`Token created and minted:`);
            console.log(`   ${generateExplorerUrl(initSig)}`);
            console.log(`   ${generateExplorerUrl(mintSig)}`);
            
            console.log(`New NFT:`);
            console.log(`   ${generateExplorerUrl(mint.toBase58(), true)}`);
            setNftlink(generateExplorerUrl(mint.toBase58(), true));
            setMintAddress(mint.toBase58());

            onMint(mint.toBase58());

            openModal();
        } catch (error) {
            console.error("Minting failed", error);
        }
    }, [publicKey, name, symbol, jsonURI, sendTransaction, signTransaction, connection, onMint]);

    return (
        <div className="flex flex-row justify-center">
            <div className="relative group items-center">
                <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <button
                    className={`group w-60 m-2 btn animate-pulse bg-buttonBackground hover:bg-buttonHover text-textdark ${!publicKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={onClick} 
                    disabled={!publicKey}
                >
                    <div className="hidden group-disabled:block">
                        Wallet not connected
                    </div>
                    <span className="block group-disabled:hidden">
                        Mint NFT
                    </span>
                </button>
            </div>
            <TransactionModal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>NFT minted successfully</h2>
                <CopyLink value={mintAddress} explorerLink={nftlink} />
            </TransactionModal>
        </div>
    );
};
