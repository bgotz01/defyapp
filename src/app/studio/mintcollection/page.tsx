// src/app/studio/mintcollection/page.tsx

"use client";


import { FC, useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { RequestAirdrop } from '../mint/components/RequestAirdrop';
import { MintCollection } from '../mint/components/MintCollection';
import useUserSOLBalanceStore from '../mint/stores/useUserSOLBalanceStore';
import { TextInput } from '../mint/components/TextInput';
import { useTheme } from '@/contexts/ThemeContext';

const MintCollectionPage: FC = () => {
    const wallet = useWallet();
    const { connection } = useConnection();
    const { theme } = useTheme();
    const balance = useUserSOLBalanceStore((s) => s.balance);
    const { getUserSOLBalance } = useUserSOLBalanceStore();

    const [name, setName] = useState<string>('');
    const [symbol, setSymbol] = useState<string>('');
    const [jsonURI, setJsonURI] = useState<string>('');

    useEffect(() => {
        if (wallet.publicKey) {
            getUserSOLBalance(wallet.publicKey, connection);
        }
    }, [wallet.publicKey, connection, getUserSOLBalance]);

    return (
        <div className={`md:hero mx-auto p-4 ${theme === 'light' ? 'bg-bglight text-textlight' : 'bg-bgdark text-textdark'}`}>
            <div className="md:hero-content flex flex-col items-center">
                <div className='mt-6'>
                    <h1 className="text-center text-5xl font-bold mb-4">
                        Mint Collection
                    </h1>
                </div>
                <div className="flex flex-col mt-2 items-center">
                    <RequestAirdrop />
                    <h4 className="md:w-full text-2xl my-2 text-center">
                        {wallet && <div className="flex flex-row justify-center items-center">
                            <h1>Balance: </h1>
                            <div>
                                {(balance || 0).toLocaleString()}
                            </div>
                            <div className="ml-2">
                                SOL
                            </div>
                        </div>}
                    </h4>
                </div>
                <div className={`flex flex-col items-center space-y-4 p-4 rounded-lg mb-4 w-full max-w-xl ${theme === 'light' ? 'bg-productContainerLight' : 'bg-productContainerDark'}`}>
                    <TextInput label="Name" placeholder="Input the name" value={name} onChange={setName} />
                    <TextInput label="Symbol" placeholder="Input the Symbol" value={symbol} onChange={setSymbol} />
                    <TextInput label="JSON URI" placeholder="Input the Json URI" value={jsonURI} onChange={setJsonURI} />
                    <MintCollection name={name} symbol={symbol} jsonURI={jsonURI} onMint={(tokenAddress) => { console.log('Minted NFT Address:', tokenAddress); }} />
                </div>
            </div>
        </div>
    );
};

export default MintCollectionPage;
