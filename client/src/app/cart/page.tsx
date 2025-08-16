"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../utils/cartContext';
import { useAuth } from '../../utils/authContext';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  inventory_count: number;
};

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated, checkingAuth } = useAuth();
  const router = useRouter();
  const [quantityErrors, setQuantityErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [productsData, setProductsData] = useState<Record<string, Product>>({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState('');

  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, checkingAuth, router]);

  // Fetch product data for inventory validation
  useEffect(() => {
    const fetchProductData = async () => {
      // Only fetch if we have items and we're authenticated
      if (items.length > 0 && isAuthenticated && !checkingAuth) {
        setIsLoadingProducts(true);
        setProductError('');
        
        try {
          // Get unique product IDs from cart
          const productIds = [...new Set(items.map(item => item.productId))];
          
          // Fetch data for each product
          const productDataMap: Record<string, Product> = {};
          
          await Promise.all(productIds.map(async (productId) => {
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch product ${productId}`);
            }
            
            const data = await response.json();
            productDataMap[productId] = data.product;
          }));
          
          setProductsData(productDataMap);
          
          // Validate current quantities against inventory
          const newErrors: Record<string, string> = {};
          items.forEach(item => {
            const product = productDataMap[item.productId];
            if (product && item.quantity > product.inventory_count) {
              newErrors[item.productId] = `Only ${product.inventory_count} available in stock`;
            }
          });
          
          setQuantityErrors(newErrors);
        } catch (error) {
          console.error('Error fetching product data:', error);
          setProductError('Failed to fetch product data. Some inventory limits may not be accurate.');
        } finally {
          setIsLoadingProducts(false);
        }
      }
    };
    
    fetchProductData();
  }, [items, isAuthenticated, checkingAuth]);


  // Handle quantity change with validation
  const handleQuantityChange = (productId: string, grindOption: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantityErrors({ ...quantityErrors, [`${productId}-${grindOption}`]: 'Quantity must be at least 1' });
      return;
    }
    
    // Check against inventory limits
    const product = productsData[productId];
    if (product && newQuantity > product.inventory_count) {
      setQuantityErrors({ ...quantityErrors, [`${productId}-${grindOption}`]: `Only ${product.inventory_count} available in stock` });
      return;
    }
    
    // If valid, update quantity and clear any error
    const success = updateQuantity(productId, grindOption, newQuantity);
    if (success) {
      const updatedErrors = { ...quantityErrors };
      delete updatedErrors[`${productId}-${grindOption}`];
      setQuantityErrors(updatedErrors);
    }
  };

  // Handle item removal
  const handleRemoveItem = (productId: string, grindOption: string) => {
    removeFromCart(productId, grindOption);
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Redirect to checkout page
  const handleCheckout = () => {
    setProcessing(true);
    router.push('/checkout');
  };

  if (!isClient || checkingAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
        <div className="animate-pulse flex flex-col items-center p-12">
          <div className="rounded-full bg-amber-200 h-12 w-12 mb-4"></div>
          <div className="text-amber-800">Loading cart...</div>
        </div>
      </div>
    );
  }

  // If authenticated but cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Cart</h1>
          <div className="flex flex-col items-center justify-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Link href="/products" className="bg-amber-700 text-white px-6 py-2 rounded-md hover:bg-amber-800 transition-colors duration-300">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Your Cart</h1>
        
        {/* Product data loading error */}
        {productError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded mb-4">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {productError}
            </p>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-6">
          {items.map((item) => (
            <div key={`${item.productId}-${item.grindOption}`} className="flex flex-col md:flex-row border-b border-gray-200 pb-6">
              {/* Item Image */}
              <div className="md:w-1/6 h-24 bg-amber-100 rounded-md overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/web-images/file.svg'; // fallback image
                  }}
                />
              </div>
              
              {/* Item Details */}
              <div className="md:w-3/6 md:px-4 mt-4 md:mt-0">
                <h3 className="text-lg font-semibold text-amber-900">{item.name}</h3>
                <p className="text-gray-600 text-sm">
                  Grind: <span className="font-medium">{item.grindOption}</span>
                </p>
                <p className="text-amber-700 mt-1">{formatPrice(item.price)} each</p>
              </div>
              
              {/* Quantity Controls */}
              <div className="md:w-1/6 flex items-center mt-4 md:mt-0 md:justify-center">
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.grindOption, item.quantity - 1)}
                    className="p-1 border border-gray-300 rounded-l-md hover:bg-gray-100 text-black"
                    disabled={isLoadingProducts}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={productsData[item.productId]?.inventory_count || 999}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.productId, item.grindOption, parseInt(e.target.value) || 1)}
                    className={`w-12 text-center border-t border-b border-gray-300 p-1 text-black ${quantityErrors[item.productId] ? 'border-red-300' : ''}`}
                    disabled={isLoadingProducts}
                  />
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.grindOption, item.quantity + 1)}
                    className="p-1 border border-gray-300 rounded-r-md hover:bg-gray-100 text-black"
                    disabled={isLoadingProducts || (productsData[item.productId] && item.quantity >= productsData[item.productId].inventory_count)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {quantityErrors[`${item.productId}-${item.grindOption}`] && (
                  <p className="text-xs text-red-600 mt-1">{quantityErrors[`${item.productId}-${item.grindOption}`]}</p>
                )}
                {productsData[item.productId] && !quantityErrors[item.productId] && (
                  <p className="text-xs text-gray-500 mt-1">In stock: {productsData[item.productId].inventory_count}</p>
                )}
              </div>
              
              {/* Item Total */}
              <div className="md:w-1/6 flex items-center justify-between md:justify-end mt-4 md:mt-0">
                <span className="text-amber-800 font-medium">{formatPrice(item.price * item.quantity)}</span>
                <button
                  onClick={() => handleRemoveItem(item.productId, item.grindOption)}
                  className="text-red-500 hover:text-red-700 ml-4"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            <span className="text-xl font-bold text-amber-900">{formatPrice(getCartTotal())}</span>
          </div>

          <div className="mt-6 space-y-3">
            <Link 
              href="/products" 
              className="block text-center bg-white border border-amber-700 text-amber-700 px-6 py-2 rounded-md hover:bg-amber-50 transition-colors duration-300"
            >
              Continue Shopping
            </Link>
            <button
              onClick={handleCheckout}
              disabled={processing || items.length === 0}
              className={`w-full ${processing ? 'bg-amber-500' : 'bg-amber-700'} text-white py-3 px-6 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300 flex items-center justify-center`}
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}