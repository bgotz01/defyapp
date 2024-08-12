// src/app/dashboard/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isAuthenticated } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';
import VerifyWallet from '@/components/VerifyWallet';
import useWalletAddress from '@/hooks/useWallet'; // Import the custom hook

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [solanaWallets, setSolanaWallets] = useState<string[]>([]);
  const [newSolanaWallet, setNewSolanaWallet] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [showShipping, setShowShipping] = useState(false);
  const [editAddressMode, setEditAddressMode] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const connectedWallet = useWalletAddress(); // Use the custom hook

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
    } else {
      isAuthenticated(token).then((authenticated) => {
        if (!authenticated) {
          router.push('/login');
        } else {
          axios.get('http://localhost:4000/api/userinfo', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }).then(response => {
            const { username, email, solanaWallet, userId, role, shippingAddress } = response.data;
            setUsername(username);
            setEmail(email);
            setSolanaWallets(solanaWallet || []);
            setUserId(userId);
            setRole(role);
            setShippingAddress(shippingAddress || {});
          }).catch(error => {
            console.error('Error fetching user info:', error);
            router.push('/login');
          });
        }
      });
    }
  }, [router]);

  // For debugging
  useEffect(() => {
    console.log('Connected wallet:', connectedWallet);
  }, [connectedWallet]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleAddWallet = async () => {
    if (newSolanaWallet.trim() === '') return;
  
    try {
      const token = localStorage.getItem('token');
      console.log('Requesting to add wallet:', newSolanaWallet);
      const response = await axios.post('http://localhost:4000/api/userinfo/wallet', {
        walletAddress: newSolanaWallet
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        console.log('Wallet added successfully:', response.data.solanaWallet);
        setSolanaWallets(response.data.solanaWallet);
        setNewSolanaWallet('');
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
    }
  };
  

  const handleRemoveWallet = async (walletToRemove: string) => {
    // Ask for user confirmation
    const confirmed = window.confirm(`Are you sure you want to remove the wallet: ${walletToRemove}?`);
  
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete('http://localhost:4000/api/userinfo/wallet', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: { walletAddress: walletToRemove }
        });
  
        if (response.status === 200) {
          setSolanaWallets(response.data.solanaWallet);
        }
      } catch (error) {
        console.error('Error removing wallet:', error);
      }
    }
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
  
    try {
      const response = await axios.put('http://localhost:4000/api/userinfo', {
        shippingAddress
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        const { shippingAddress } = response.data;
        setShippingAddress(shippingAddress);
        setEditAddressMode(false);
      }
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleCollectionsClick = async () => {
    const token = localStorage.getItem('token');
    const authenticated = await isAuthenticated(token);
    if (authenticated) {
      router.push('/studio/collections');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center ${theme === 'light' ? 'bg-bglight' : 'bg-bgdark'} p-4`}>
      {/* VerifyWallet component */}
      <VerifyWallet connectedWallet={connectedWallet} />
      <Card className={`w-full max-w-2xl p-8 ${theme === 'light' ? 'bg-productContainerLight' : 'bg-productContainerDark'}`}>
        <Button className="w-full mb-6 text-lg py-3 bg-buttonBackground hover:bg-buttonHover text-textdark" onClick={handleCollectionsClick}>My Collections</Button>
        <h2 className={`text-2xl font-bold mb-6 text-center ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>Welcome, {username}</h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Username:</strong> {username}</p>
            </div>
            <div>
              <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Email:</strong> {email}</p>
            </div>
            <div>
              <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>User ID:</strong> <span className="break-all">{userId}</span></p>
            </div>
            <div>
              <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Role:</strong> {role === 'designer' ? 'Designer' : 'N/A'}</p>
            </div>
            <div>
              <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Solana Wallets:</strong></p>
              <ul className="space-y-2">
                {solanaWallets.map((wallet, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="break-all">{wallet}</span>
                    <Button type="button" onClick={() => handleRemoveWallet(wallet)} className="text-red-600">Remove</Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="new-wallet" className={`block text-sm font-medium ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>Add Solana Wallet</label>
            <div className="flex items-center space-x-2">
              <Input
                id="new-wallet"
                value={newSolanaWallet}
                onChange={(e) => setNewSolanaWallet(e.target.value)}
                placeholder="Enter new Solana wallet"
                className={theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}
              />
              <Button type="button" onClick={handleAddWallet} className="bg-buttonBackground hover:bg-buttonHover text-textdark">Add</Button>
            </div>
          </div>

          {/* Shipping Address Section */}
          <Card className={`p-6 ${theme === 'light' ? 'bg-productContainerLight' : 'bg-productContainerDark'}`}>
            <div className="flex justify-between items-center">
              <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>Shipping Address</h3>
              <Button onClick={() => setShowShipping(!showShipping)} className='text:white'>
                {showShipping ? 'Hide Address' : 'Show Address'}
              </Button>
            </div>
            {showShipping && (
              <div className="mt-4 space-y-4">
                {editAddressMode ? (
                  <form onSubmit={handleEditAddress} className="space-y-4">
                    <div>
                      <label htmlFor="street" className={`block text-sm font-medium ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>Street</label>
                      <Input 
                        id="street"
                        value={shippingAddress.street} 
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})} 
                        className={theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}
                      />
                    </div>
                    <div>
                      <label htmlFor="apartment" className={`block text-sm font-medium ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>Apartment/Unit</label>
                      <Input 
                        id="apartment"
                        value={shippingAddress.apartment} 
                        onChange={(e) => setShippingAddress({...shippingAddress, apartment: e.target.value})} 
                        className={theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className={`block text-sm font-medium ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>City</label>
                      <Input 
                        id="city"
                        value={shippingAddress.city} 
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} 
                        className={theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className={`block text-sm font-medium ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>State</label>
                      <Input 
                        id="state"
                        value={shippingAddress.state} 
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} 
                        className={theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className={`block text-sm font-medium ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>Postal Code</label>
                      <Input 
                        id="postalCode"
                        value={shippingAddress.postalCode} 
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})} 
                        className={theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className={`block text-sm font-medium ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>Country</label>
                      <Input 
                        id="country"
                        value={shippingAddress.country} 
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})} 
                        className={theme === 'light' ? 'bg-silver text-textlight' : 'bg-productContainerDark text-textdark'}
                      />
                    </div>
                    <Button type="submit" className="mt-4 bg-buttonBackground hover:bg-buttonHover text-textdark">Save Changes</Button>
                    <Button type="button" onClick={() => setEditAddressMode(false)} className="mt-4 bg-buttonBackground hover:bg-buttonHover text-textdark">Cancel</Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Street:</strong> {shippingAddress.street}</p>
                    <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Apartment/Unit:</strong> {shippingAddress.apartment}</p>
                    <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>City:</strong> {shippingAddress.city}</p>
                    <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>State:</strong> {shippingAddress.state}</p>
                    <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Postal Code:</strong> {shippingAddress.postalCode}</p>
                    <p className={`text-lg ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}><strong>Country:</strong> {shippingAddress.country}</p>
                    <Button onClick={() => setEditAddressMode(true)} className="mt-4 bg-buttonBackground hover:bg-buttonHover text-textdark">Edit Address</Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </Card>

      <Button onClick={handleLogout} className="mt-8 bg-red-600 hover:bg-red-700 text-white">Logout</Button>
    </div>
  );
};

export default Dashboard;
