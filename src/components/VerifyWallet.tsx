// src/components/VerifyWallet.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface VerifyWalletProps {
  connectedWallet: string | null;
}

const VerifyWallet: React.FC<VerifyWalletProps> = ({ connectedWallet }) => {
  const [isWalletConnected, setIsWalletConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSavedWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/api/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.solanaWallet || [];
    } catch (error) {
      console.error('Error fetching saved wallets:', error);
      return [];
    }
  };

  const checkWalletMatch = async () => {
    if (!connectedWallet) return;

    setLoading(true);

    try {
      const savedWallets = await fetchSavedWallets();

      if (!savedWallets.length) {
        setIsWalletConnected(false);
        return;
      }

      const isMatch = savedWallets.includes(connectedWallet);
      setIsWalletConnected(isMatch);
    } catch (error) {
      console.error('Error checking wallet match:', error);
      setIsWalletConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectedWallet) {
      checkWalletMatch();
    }
  }, [connectedWallet]);

  return (
    <div className="p-4">
      <p><strong>Connected Wallet:</strong> {connectedWallet || 'No wallet connected'}</p>
      {loading ? (
        <p>Loading...</p>
      ) : isWalletConnected === null ? (
        <p>Checking wallet...</p>
      ) : isWalletConnected ? (
        <p className="text-green-600">Connection: Valid</p>
      ) : (
        <p className="text-red-600">Connection: Wallet not in database</p>
      )}
    </div>
  );
};

export default VerifyWallet;
