// src/components/GroupedNFTList.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface NFT {
  _id: string;
  tokenAddress: string;
}

interface NFTGroup {
  productId: string;
  productName: string;
  nfts: NFT[];
}

const GroupedNFTList: React.FC = () => {
  const [nftGroups, setNftGroups] = useState<NFTGroup[]>([]);

  useEffect(() => {
    const fetchNFTGroups = async () => {
      try {
        const response = await axios.get<NFTGroup[]>('/api/nfts/grouped-by-product');
        setNftGroups(response.data);
      } catch (error) {
        console.error('Error fetching NFT groups:', error);
      }
    };

    fetchNFTGroups();
  }, []);

  return (
    <div>
      {nftGroups.map(group => (
        <div key={group.productId}>
          <h2>{group.productName}</h2>
          <ul>
            {group.nfts.map(nft => (
              <li key={nft._id}>{nft.tokenAddress}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default GroupedNFTList;
