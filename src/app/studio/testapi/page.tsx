"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const TestAPI: React.FC = () => {
  const [nftData, setNftData] = useState<{ listed: string; username: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tokenAddress = "Hb7rqkaAvsgDhQRxt6MZ5X8FXrQT7RuAGLQTMuknr9QH"; // The token address to test

  useEffect(() => {
    // Function to fetch all NFTs from the API and filter the specific one
    const fetchNftData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/public/nfts');
        const nfts = response.data;

        // Filter the specific NFT by the given tokenAddress
        const nft = nfts.find((nft: any) => nft._id === tokenAddress);

        if (nft) {
          setNftData({ listed: nft.listed, username: nft.username });
        } else {
          setError("NFT not found.");
        }
      } catch (err) {
        console.error("Failed to fetch NFT data:", err);
        setError("Failed to fetch NFT data.");
      }
    };

    fetchNftData(); // Fetch the data when the component mounts
  }, []);

  return (
    <div className="p-4 pt-20 bg-bglight dark:bg-bgdark min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-textlight dark:text-textdark">
        Test API Page
      </h1>

      {error && (
        <div className="text-red-500 dark:text-red-400 text-center mb-4">
          {error}
        </div>
      )}

      {nftData ? (
        <div className="text-center">
          <p className="text-lg text-textlight dark:text-textdark">
            <strong>Listed:</strong> {nftData.listed}
          </p>
          <p className="text-lg text-textlight dark:text-textdark">
            <strong>Username:</strong> {nftData.username}
          </p>
        </div>
      ) : (
        <p className="text-center text-textlight dark:text-textdark">
          Loading data...
        </p>
      )}
    </div>
  );
};

export default TestAPI;
