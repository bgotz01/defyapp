//src/models/User.js

import mongoose from 'mongoose';

const userCollectionAddressesSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Collection model
    ref: 'Collection',
    required: true,
  },
  collectionAddress: {
    type: String, // Collection address as a string
    required: true,
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  solanaWallet: {
    type: [String],  // Array of strings
    default: [],
  },
  role: {
    type: String,
    required: true,
    default: 'regular',
  },
  shippingAddress: {
    street: {
      type: String,
      required: false,  // Make this field optional
    },
    apartment: {
      type: String,
      default: '',  // Optional field
    },
    city: {
      type: String,
      required: false,  // Make this field optional
    },
    state: {
      type: String,
      required: false,  // Make this field optional
    },
    postalCode: {
      type: String,
      required: false,  // Make this field optional
    },
    country: {
      type: String,
      required: false,  // Make this field optional
    }
  },
  collectionAddresses: {
    type: [userCollectionAddressesSchema], // Array of userCollectionAddressesSchema objects
    default: [],
  }
});

const User = mongoose.model('User', userSchema);

export default User;
