//src/app/register.page.tsx

'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [solanaWallet, setSolanaWallet] = useState('');
  const [role, setRole] = useState('regular'); // Default to 'regular'
  const [designerCode, setDesignerCode] = useState(''); // State for designer code
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate designer code if role is 'designer'
      if (role === 'designer' && designerCode !== 'defydesigner') {
        setError('Invalid designer code.');
        return;
      }

      const response = await axios.post('http://localhost:4000/api/register', {
        username,
        password,
        email,
        solanaWallet,
        role,
      });

      if (response.status === 201) {
        router.push('/login');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-customGrey p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Register</h2>
        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-white text-black dark:text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-white text-black dark:text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-white text-black dark:text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white" htmlFor="solanaWallet">
              Solana Wallet (Optional)
            </label>
            <input
              type="text"
              id="solanaWallet"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-white text-black dark:text-black"
              value={solanaWallet}
              onChange={(e) => setSolanaWallet(e.target.value)}
            />
          </div>
          {role === 'designer' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-black dark:text-white" htmlFor="designerCode">
                Designer Code
              </label>
              <input
                type="text"
                id="designerCode"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-white text-black dark:text-black"
                value={designerCode}
                onChange={(e) => setDesignerCode(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4 flex items-center">
            <input
              type="radio"
              id="roleRegular"
              name="role"
              value="regular"
              checked={role === 'regular'}
              onChange={() => setRole('regular')}
              className="mr-2"
            />
            <label htmlFor="roleRegular" className="text-black dark:text-white">Register as Regular User</label>
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="radio"
              id="roleDesigner"
              name="role"
              value="designer"
              checked={role === 'designer'}
              onChange={() => setRole('designer')}
              className="mr-2"
            />
            <label htmlFor="roleDesigner" className="text-black dark:text-white">Register as Designer</label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Register
          </button>
        </form>
        <div>
          <Link href="/login/page">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
