//server.js

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import connectMongo from './src/lib/db.js';
import User from './src/models/User.js';
import Collection from './src/models/Collection.js';
import Product from './src/models/Product.js';
import Sizes from './src/models/Sizes.js';
import NFT from './src/models/NFT.js';
import axios from 'axios';

// Load environment variables from .env file
dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());

// MongoDB connection
connectMongo();


// USERS 



// User registration route
server.post('/api/register', async (req, res) => {
  const { username, password, email, solanaWallet, role, shippingAddress } = req.body;

  const userRole = role === 'designer' ? 'designer' : 'regular';

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      email,
      solanaWallet: solanaWallet ? [solanaWallet] : [],  // Ensure it's an array or empty
      role: userRole,
      shippingAddress: shippingAddress || {},  // Default to an empty object if not provided
      collectionAddresses: []  // Initialize collections as an empty array
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error during registration:', error); // Log any errors
    res.status(400).json({ message: error.message });
  }
});




// User login route
server.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret');
    res.status(200).json({
      token,
      user: {
        username: user.username,
        email: user.email,
        solanaWallet: user.solanaWallet,
        _id: user._id
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch user info route
server.get('/api/userinfo', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      username: user.username,
      email: user.email,
      solanaWallet: user.solanaWallet,  // Array of wallet addresses
      userId: user._id,
      role: user.role,
      shippingAddress: user.shippingAddress
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});


// Update user info route
server.put('/api/userinfo', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { email, solanaWallet, shippingAddress } = req.body;

    const updateFields = {};
    if (email) updateFields.email = email;
    if (Array.isArray(solanaWallet)) updateFields.solanaWallet = solanaWallet;  // Ensure it's an array
    if (shippingAddress) updateFields.shippingAddress = shippingAddress;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      updateFields,
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      username: updatedUser.username,
      email: updatedUser.email,
      solanaWallet: updatedUser.solanaWallet,
      userId: updatedUser._id,
      shippingAddress: updatedUser.shippingAddress
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});


// Add wallet address route
server.post('/api/userinfo/wallet', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { walletAddress } = req.body;

    if (!walletAddress) return res.status(400).json({ message: 'Wallet address is required' });

    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Add wallet address to the array if it does not already exist
    if (!user.solanaWallet.includes(walletAddress)) {
      user.solanaWallet.push(walletAddress);
      await user.save();
    }

    res.status(200).json({ solanaWallet: user.solanaWallet });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});



// Remove a single Solana wallet address
server.delete('/api/userinfo/wallet', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  const { walletAddress } = req.body;

  if (!walletAddress) return res.status(400).json({ message: 'No wallet address provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter out the wallet to be removed
    user.solanaWallet = user.solanaWallet.filter(wallet => wallet !== walletAddress);

    await user.save();

    res.status(200).json({
      username: user.username,
      email: user.email,
      solanaWallet: user.solanaWallet,
      userId: user._id,
      shippingAddress: user.shippingAddress
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});


// Verify if wallet address exists in saved wallets
server.get('/api/userinfo/verify-wallet', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { walletAddress } = req.query;

    if (!walletAddress) return res.status(400).json({ message: 'Wallet address is required' });

    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = user.solanaWallet.includes(walletAddress);
    res.status(200).json({ isMatch });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});






// COLLECTIONS

// Create collection route
server.post('/api/collections', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { name, collectionAddress, imageUrl, jsonUrl } = req.body;

    if (!name || !collectionAddress || !imageUrl || !jsonUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the new collection
    const collection = new Collection({
      name,
      collectionAddress,
      imageUrl,
      jsonUrl,
      designerId: decoded.id,
      designerUsername: user.username,
      products: []
    });

    await collection.save();

    // Add the collection to the user's collectionAddresses array
    user.collectionAddresses.push({
      collectionId: collection._id,
      collectionAddress: collectionAddress // Add collection address to user's collectionAddresses
    });

    await user.save();

    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(400).json({ message: error.message });
  }
});





// Edit collection route
server.put('/api/collections/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { id } = req.params;
    const { name, collectionAddress, imageUrl, jsonUrl } = req.body;

    if (!name || !collectionAddress || !imageUrl || !jsonUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const collection = await Collection.findById(id);
    if (!collection || !collection.designerId.equals(decoded.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    collection.name = name;
    collection.collectionAddress = collectionAddress;
    collection.imageUrl = imageUrl;
    collection.jsonUrl = jsonUrl;

    await collection.save();
    res.status(200).json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete collection route
server.delete('/api/collections/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { id } = req.params;

    console.log('Decoded Token:', decoded); // Add logging
    const collection = await Collection.findById(id);
    if (!collection) {
      console.log('Collection not found'); // Add logging
      return res.status(404).json({ message: 'Collection not found' });
    }
    if (!collection.designerId.equals(decoded.id)) {
      console.log('Access denied'); // Add logging
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete the collection
    await Collection.deleteOne({ _id: id });

    // Remove the collection from the user's collectionAddresses array
    await User.updateOne(
      { _id: decoded.id },
      { $pull: { collectionAddresses: { collectionId: id } } }
    );

    res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error); // Add logging
    res.status(400).json({ message: error.message });
  }
});


// Fetch collections route
server.get('/api/collections', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const collections = await Collection.find({ designerId: decoded.id });
    res.status(200).json(collections);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// DISCOVER PUBLIC

//Fetch all public collections
server.get('/api/public/collections', async (req, res) => {
  try {
    const collections = await Collection.find();
    res.status(200).json(collections);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Fetch a single public collection by ID
server.get('/api/public/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Add this route for fetching collection by collectionAddress
server.get('/api/public/collections/address/:collectionAddress', async (req, res) => {
  try {
    const { collectionAddress } = req.params;
    const collection = await Collection.findOne({ collectionAddress });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch products in a specific collection for public access
server.get('/api/public/collections/:collectionId/products', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const products = await Product.find({ collectionId });
    if (!products) {
      return res.status(404).json({ message: 'Products not found' });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch designer by ID
server.get('/api/public/designer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const designer = await User.findById(id).select('username');
    if (!designer) return res.status(404).json({ message: 'Designer not found' });
    res.status(200).json(designer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch designer by wallet address
server.get('/api/public/designer/by-wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const designer = await User.findOne({ solanaWallet: walletAddress }).select('username');
    if (!designer) return res.status(404).json({ message: 'Designer not found' });
    res.status(200).json(designer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch NFT by token address (public route)
server.get('/api/public/nft/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    const nft = await NFT.findOne({ tokenAddress });
    if (!nft) return res.status(404).json({ message: 'NFT not found' });
    res.status(200).json(nft);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch product by product ID (public route)
server.get('/api/public/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate('designerId', 'username');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PRODUCTS

// Fetch products in a collection
server.get('/api/collections/:collectionId/products', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { collectionId } = req.params;

    const collection = await Collection.findById(collectionId);
    if (!collection || !collection.designerId.equals(decoded.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const products = await Product.find({ collectionId });
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Fetch products created by the logged-in user
server.get('/api/products', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Decoded User ID:', decoded.id); // Debugging
    const products = await Product.find({ designerId: decoded.id });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products.', error });
  }
});


// Add product to collection route
server.post('/api/products', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { name, gender, category, color, description, price, collectionId, imageUrl1, imageUrl2, imageUrl3, imageUrl4, imageUrl5, jsonUrl, videoUrl } = req.body;

    if (!name || !gender || !category || !color || !price || !collectionId || !imageUrl1) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection || !collection.designerId.equals(decoded.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Designer not found' });
    }

    const product = new Product({
      name,
      gender,
      category,
      color,
      description,
      price,
      collectionId,
      collectionAddress: collection.collectionAddress, // Save collection address
      imageUrl1,
      imageUrl2,
      imageUrl3,
      imageUrl4,
      imageUrl5,
      jsonUrl,
      videoUrl,
      designerId: user._id,
      username: user.username
    });

    await product.save();

    collection.products.push(product._id);
    await collection.save();

    res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Edit product route
server.put('/api/products/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { id } = req.params;
    const { name, category, description, price, imageUrl1, imageUrl2, imageUrl3, imageUrl4, imageUrl5, jsonUrl } = req.body;

    // Fetch the existing product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const collection = await Collection.findById(product.collectionId);
    if (!collection || !collection.designerId.equals(decoded.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update only the fields that are provided
    if (name) product.name = name;
    if (category) product.category = category;
    if (description) product.description = description;
    if (price !== undefined) product.price = price; // Handle price as it might be 0
    if (imageUrl1) product.imageUrl1 = imageUrl1;
    if (imageUrl2 !== undefined) product.imageUrl2 = imageUrl2; // Allow null or empty values
    if (imageUrl3 !== undefined) product.imageUrl3 = imageUrl3;
    if (imageUrl4 !== undefined) product.imageUrl4 = imageUrl4;
    if (imageUrl5 !== undefined) product.imageUrl5 = imageUrl5;
    if (jsonUrl) product.jsonUrl = jsonUrl;

    // Save the updated product
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(400).json({ message: error.message });
  }
});



// Delete product route
server.delete('/api/products/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const collection = await Collection.findById(product.collectionId);
    if (!collection || !collection.designerId.equals(decoded.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove the product reference from the collection
    collection.products.pull(product._id);
    await collection.save();

    // Delete the product
    await Product.deleteOne({ _id: id });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Fetch product by ID route
server.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch all public collections route
server.get('/api/public/collections', async (req, res) => {
  try {
    const collections = await Collection.find();
    res.status(200).json(collections);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch NFTs by product ID
server.get('/api/public/products/:productId/nfts', async (req, res) => {
  try {
    const { productId } = req.params;
    // Fetch NFTs associated with the productId
    const nfts = await NFT.find({ productId });
    if (!nfts || nfts.length === 0) {
      return res.status(404).json({ message: 'No NFTs found for this product' });
    }
    res.status(200).json(nfts);
  } catch (error) {
    console.error('Error fetching NFTs by product ID:', error);
    res.status(400).json({ message: error.message });
  }
});




// SIZES

// Fetch sizes for a product
server.get('/api/products/:productId/sizes', async (req, res) => {
  try {
    const { productId } = req.params;
    const sizes = await Sizes.find({ productId });
    res.status(200).json(sizes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a size to a product
server.post('/api/sizes', async (req, res) => {
  const { productId, size, quantity } = req.body;

  if (!productId || !size || !quantity) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const newSize = new Sizes({ productId, size, quantity });
    await newSize.save();
    res.status(201).json(newSize);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a size
server.delete('/api/sizes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Sizes.findByIdAndDelete(id);
    res.status(200).json({ message: 'Size deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a size
server.put('/api/sizes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity is required and must be greater than 0' });
    }

    const size = await Sizes.findById(id);
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }

    size.quantity = quantity;

    await size.save();
    res.status(200).json(size);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//FILTERS 


// Fetch products with filters and include NFT count and first NFT token address
server.get('/api/public/products', async (req, res) => {
  const { category, designer, minPrice, maxPrice, color, size, hasNFTsForSale } = req.query;

  let filters = {};

  if (category) {
    filters.category = category;
  }

  if (designer) {
    filters.username = designer;
  }

  if (color) {
    // Convert the color to lowercase for case-insensitive matching
    filters.color = { $in: [color.toLowerCase()] };
  }

  if (size) {
    filters.size = size;
  }

  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) {
      filters.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      filters.price.$lte = parseFloat(maxPrice);
    }
  }

  if (hasNFTsForSale === 'true') {
    try {
      const productIdsWithNFTs = await NFT.distinct('productId');
      filters._id = { $in: productIdsWithNFTs };
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch NFT data' });
    }
  }

  try {
    const products = await Product.find(filters).lean();
    const productIds = products.map(product => product._id);
    
    const nftData = await NFT.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 },
          firstTokenAddress: { $first: "$tokenAddress" }
        }
      }
    ]);

    const nftDataMap = nftData.reduce((acc, nft) => {
      acc[nft._id] = { count: nft.count, firstTokenAddress: nft.firstTokenAddress };
      return acc;
    }, {});

    const productsWithNftData = products.map(product => ({
      ...product,
      nftCount: nftDataMap[product._id]?.count || 0,
      firstNftTokenAddress: nftDataMap[product._id]?.firstTokenAddress || null,
    }));

    res.json(productsWithNftData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});



// Fetch products with category "Dresses"
server.get('/api/categories/dresses', async (req, res) => {
  try {
    const products = await Product.find({ category: 'Dresses' });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});





// DESIGNERS

// Fetch all designers route
server.get('/api/designers', async (req, res) => {
  try {
    const designers = await User.find({ role: 'designer' }).select('username email solanaWallet');
    res.status(200).json(designers);
  } catch (error) {
    console.error('Error fetching designers:', error);
    res.status(400).json({ message: error.message });
  }
});

// Fetch collections by designer route
server.get('/api/collections/by-designer/:designerId', async (req, res) => {
  try {
    const { designerId } = req.params;
    const collections = await Collection.find({ designerId }).select('name collectionAddress imageUrl jsonUrl');
    res.status(200).json(collections);
  } catch (error) {
    console.error('Error fetching collections by designer:', error);
    res.status(400).json({ message: error.message });
  }
});

// Fetch designer by username
server.get('/api/public/designers/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const designer = await User.findOne({ username, role: 'designer' });
    if (!designer) return res.status(404).json({ message: 'Designer not found' });
    res.status(200).json(designer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Designer profile endpoint
server.get('/api/public/designers/:designerId', async (req, res) => {
  try {
    const { designerId } = req.params;
    const designer = await User.findById(designerId).select('username solanaWallet');
    if (!designer) return res.status(404).json({ message: 'Designer not found' });

    const collections = await Collection.find({ designerId }).select('name imageUrl');
    res.status(200).json({ ...designer.toObject(), collections });
  } catch (error) {
    console.error('Error fetching designer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// REGULAR USERS

// Fetch single collection for public users route
server.get('/api/public/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Fetching collection with ID for public:', id); // Logging

    const collection = await Collection.findById(id);
    if (!collection) {
      console.log('Collection not found'); // Logging
      return res.status(404).json({ message: 'Collection not found' });
    }

    res.status(200).json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error); // Logging
    res.status(400).json({ message: error.message });
  }
});


//NFTS

server.post('/api/saveNFT', async (req, res) => {
  const { tokenAddress, walletAddress } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const designerId = decoded.id;

    if (!tokenAddress || !walletAddress) {
      return res.status(400).json({ success: false, message: 'Token address and wallet address are required.' });
    }

    const user = await User.findById(designerId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Designer not found' });
    }

    const nft = new NFT({
      _id: tokenAddress, // Use tokenAddress as _id
      walletAddress,
      designerId,
      username: user.username,
      productId: null, // Initially null, will be updated later
      active: 'no' // Set the default value for the active field
    });

    await nft.save();
    res.status(201).json({ success: true, nft });
  } catch (error) {
    console.error('Error saving NFT:', error);
    res.status(500).json({ success: false, message: 'Failed to save NFT.', error });
  }
});



server.put('/api/updateNFT', async (req, res) => {
  const { tokenAddress, productId, active } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const designerId = decoded.id;

      // Debug: Log the request payload
      console.log('Received Payload:', { tokenAddress, productId, active });

      // Find the NFT and ensure it belongs to the designer
      const nft = await NFT.findOne({ _id: tokenAddress, designerId });
      if (!nft) {
          return res.status(404).json({ message: 'NFT not found or unauthorized' });
      }

      // Update the 'productId' and 'active' fields
      nft.productId = productId || nft.productId;
      nft.active = active;
      await nft.save();

      res.status(200).json({ success: true, nft });
  } catch (error) {
      console.error('Error updating NFT:', error);
      res.status(500).json({ success: false, message: 'Failed to update NFT.' });
  }
});






server.put('/api/nft/list', async (req, res) => {
  const { tokenAddress } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    const nft = await NFT.findOneAndUpdate(
      { tokenAddress, designerId: decoded.id },
      { listed: 'yes' },
      { new: true }
    );

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found or not authorized' });
    }

    res.status(200).json({ success: true, nft });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Fetch NFT by token address (public route)

server.get('/api/public/nft/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch all NFTs
    const nfts = await NFT.find();

    // Filter the specific NFT by the given ID
    const nft = nfts.find(nft => nft._id === id);

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    res.json(nft);
  } catch (error) {
    console.error('Error fetching NFT:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





server.get('/api/nfts', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const designerId = decoded.id;

    const nfts = await NFT.find({ designerId }).populate('productId', 'name');
    res.status(200).json(nfts);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch NFTs.', error });
  }
});

// Public endpoint to fetch all NFTs
server.get('/api/public/nfts', async (req, res) => {
  try {
    const nfts = await NFT.find().populate('productId', 'name');
    res.status(200).json(nfts);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch NFTs.', error });
  }
});

// Endpoint to fetch all NFTs from MongoDB collection
server.get('/api/all-nfts', async (req, res) => {
  try {
    const nfts = await NFT.find().populate('productId', 'name');
    res.status(200).json(nfts);
  } catch (error) {
    console.error('Error fetching all NFTs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all NFTs.', error });
  }
});

// Fetch the count of active NFTs for a specific product
server.get('/api/nfts/count/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const count = await NFT.countDocuments({ productId, active: 'yes' });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching NFT count:', error);
    res.status(500).json({ message: 'Failed to fetch NFT count.' });
  }
});

server.put('/api/updateNFTStatus', async (req, res) => {
  const { nftId, active } = req.body;

  try {
    // Find the NFT by _id and update its active status
    const updatedNFT = await NFT.findByIdAndUpdate(
      nftId,
      { active: active },
      { new: true }
    );

    if (!updatedNFT) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    res.status(200).json({ success: true, nft: updatedNFT });
  } catch (error) {
    console.error('Error updating NFT status:', error);
    res.status(500).json({ message: 'Failed to update NFT status.' });
  }
});


// BREVO
// Function to send email using Brevo
async function sendBrevoEmail(toEmail, templateId, params) {
  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: 'Your Marketplace',
        email: 'noreply@yourmarketplace.com',
      },
      to: [{ email: toEmail }],
      templateId: templateId,
      params: params,
    }, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
    });

    console.log('Email sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
  }
}

server.post('/api/purchase', async (req, res) => {
  try {
    const { buyerEmail, sellerEmail, nftId, shippingAddress } = req.body;

    // Fetch NFT details (this is an example; adjust according to your actual models and logic)
    const nftDetails = await NFT.findById(nftId);

    if (!nftDetails) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    // Update NFT status to sold (example logic)
    nftDetails.status = 'sold';
    await nftDetails.save();

    // Send email to buyer
    await sendBrevoEmail(buyerEmail, process.env.BREVO_BUYER_TEMPLATE_ID, {
      product_name: nftDetails.name,
      order_id: nftDetails._id,
      purchase_date: new Date().toLocaleDateString(),
    });

    // Send email to seller
    await sendBrevoEmail(sellerEmail, process.env.BREVO_SELLER_TEMPLATE_ID, {
      buyer_address: shippingAddress,
      product_name: nftDetails.name,
      sale_price: nftDetails.price,
    });

    res.status(200).json({ message: 'Purchase processed and emails sent.' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ message: 'Error processing purchase.' });
  }
});




// Custom route handling for Next.js pages
server.all('*', (req, res) => {
  res.status(404).send('Not found');
});

server.listen(4000, () => {
  console.log('> API server ready on http://localhost:4000');
});
