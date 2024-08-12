// src/utils/nftAggregation.ts

import mongoose from 'mongoose';
import NFT from '../models/NFT';

export const getNFTsGroupedByProductId = async (): Promise<any[]> => {
  try {
    const nftGroups = await NFT.aggregate([
      { $match: { active: 'yes' } }, // Filter only active NFTs
      {
        $group: {
          _id: '$productId',
          nfts: { $push: { _id: '$_id', tokenAddress: '$walletAddress' } },
        },
      },
      {
        $lookup: {
          from: 'products', // Assuming your products collection is named 'products'
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: '$productDetails.name',
          nfts: 1,
        },
      },
    ]);

    return nftGroups;
  } catch (error) {
    console.error('Error aggregating NFTs by productId:', error);
    throw error;
  }
};
