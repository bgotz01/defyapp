"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext"; 
import axios from "axios";
import { Sun, Moon, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Sidebar from "./Sidebar";

// Dynamically load WalletMultiButton to ensure it is only rendered on the client side
const DynamicWalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const NavBar = () => {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState<string | null>(null);
  const [discoverDropdownOpen, setDiscoverDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:4000/api/userinfo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch(() => {
          setUsername(null);
        });
    }
  }, []);

  const handleDiscoverDropdownToggle = () => {
    setDiscoverDropdownOpen(!discoverDropdownOpen);
  };

  const handleDropdownItemClick = () => {
    setDiscoverDropdownOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest(".discover-dropdown") === null) {
      setDiscoverDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <nav className={`p-4 fixed w-full top-0 z-50 ${theme === 'light' ? 'bg-bglight text-textlight' : 'bg-bgdark text-textdark'} flex justify-center`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="group relative flex items-center space-x-4">
          <div className={`flex items-center justify-center cursor-pointer ${theme === 'light' ? 'text-textlight' : 'text-textdark'}`}>
            <Menu className="text-2xl" />
            <span className="ml-2 text-xl"></span>
          </div>
          <Sidebar />
          <Link href="/" className="text-xl font-bold ml-2">
            DEFY
          </Link>
        </div>
        <div className="space-x-4 flex items-center">
          <div className="relative discover-dropdown">
            <button onClick={handleDiscoverDropdownToggle} className="hidden sm:inline">
              Discover
            </button>
            {discoverDropdownOpen && (
              <div className={`absolute mt-2 w-48 rounded-md shadow-lg z-50 ${theme === 'light' ? 'bg-bglight' : 'bg-bgdark'}`}>
                <Link href="/discover" onClick={handleDropdownItemClick} className={`block px-4 py-2 hover:bg-gray-200 ${theme === 'light' ? 'text-textlight hover:bg-gray-200' : 'text-textdark hover:bg-gray-700'}`}>
                  New
                </Link>
                <Link href="/discover/collections" onClick={handleDropdownItemClick} className={`block px-4 py-2 hover:bg-gray-200 ${theme === 'light' ? 'text-textlight hover:bg-gray-200' : 'text-textdark hover:bg-gray-700'}`}>
                  Collections
                </Link>
                <Link href="/discover/products" onClick={handleDropdownItemClick} className={`block px-4 py-2 hover:bg-gray-200 ${theme === 'light' ? 'text-textlight hover:bg-gray-200' : 'text-textdark hover:bg-gray-700'}`}>
                  Products
                </Link>
                <Link href="/discover/designers" onClick={handleDropdownItemClick} className={`block px-4 py-2 hover:bg-gray-200 ${theme === 'light' ? 'text-textlight hover:bg-gray-200' : 'text-textdark hover:bg-gray-700'}`}>
                  Designers
                </Link>
                <Link href="/discover/categories" onClick={handleDropdownItemClick} className={`block px-4 py-2 hover:bg-gray-200 ${theme === 'light' ? 'text-textlight hover:bg-gray-200' : 'text-textdark hover:bg-gray-700'}`}>
                  Categories
                </Link>
               
              </div>
            )}
          </div>
          <Link href="/marketplace" className="hidden sm:inline">
            Marketplace
          </Link>
          <button
            onClick={toggleTheme}
            className="px-2 py-1 rounded flex items-center justify-center"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          <DynamicWalletMultiButton />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
