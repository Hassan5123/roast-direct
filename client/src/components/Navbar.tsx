"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Logout from './Logout';
import { useAuth } from '../utils/authContext';
import { useCart } from '../utils/cartContext';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand Name - Always visible */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center">
            <Image 
              src="/web-images/logo.png" 
              alt="RoastDirect Logo" 
              width={50} 
              height={50} 
              className="mr-2"
            />
            <span className="text-amber-800 font-bold text-xl">RoastDirect</span>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Shop Products - Always visible */}
          <Link href="/products" className="px-4 py-2 text-gray-700 hover:text-amber-700 transition-colors duration-200">
            Shop Products
          </Link>

          {isAuthenticated ? (
            <>
              {/* Cart Icon with Item Count - Only visible when authenticated */}
              <Link href="/cart" className="p-2 text-amber-700 hover:text-amber-800 transition-colors duration-200 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>
              {/* Logout Button - Only visible when authenticated */}
              <Logout />
            </>
          ) : (
            <>
              {/* Sign Up and Login - Only visible when not authenticated */}
              <Link href="/signup" className="px-4 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800 transition-colors duration-200 w-[100px] text-center">
                Sign Up
              </Link>
              <Link href="/login" className="px-4 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800 transition-colors duration-200 w-[100px] text-center">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;