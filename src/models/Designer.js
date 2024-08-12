//src/models/Designer.js

import mongoose from 'mongoose';

const designerSchema = new mongoose.Schema({
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
    type: String,
    default: '',
  },
  role: {
    type: String,
    required: true,
    default: 'designer', // Default role is 'designer'
  },
});

const Designer = mongoose.model('Designer', designerSchema);

export default Designer;
