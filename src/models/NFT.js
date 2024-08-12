//src/models/NFT.js

import mongoose from 'mongoose';

const NFTSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  active: {
    type: String,
    default: 'no',
  },
}, {
  _id: false, // Disable automatic _id generation by Mongoose
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

const NFT = mongoose.model('NFT', NFTSchema);

export default NFT;
