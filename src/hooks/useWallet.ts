// src/hooks/useWallet.ts

import { useWallet } from '@solana/wallet-adapter-react';

const useWalletAddress = () => {
  const { publicKey } = useWallet();
  return publicKey ? publicKey.toBase58() : null;
};

export default useWalletAddress;
