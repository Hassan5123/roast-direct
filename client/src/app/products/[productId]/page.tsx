"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../utils/cartContext';
import { useAuth } from '../../../utils/authContext';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  origin_country: string;
  elevation: number;
  roast_level: string;
  farm_info: string;
  processing_method: string;
  inventory_count: number;
  tasting_notes: string[];
};

const VALID_GRIND_OPTIONS = [
  'Whole Bean', 'Aeropress', 'Espresso', 'Chemex', 'Cold Brew', 
  'Pour Over', 'French Press', 'Moka Pot', 'Auto Drip'
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [grindOption, setGrindOption] = useState<string>('');
  const [quantityError, setQuantityError] = useState<string>('');
  const [grindOptionError, setGrindOptionError] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch single product data
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to load product details');
        }
        
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err instanceof Error ? err.message : 'Unable to load product details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Calculate current quantity in cart for this product
  const currentCartQuantity = useMemo(() => {
    if (!product) return 0;
    
    // Sum quantities of this product across all grind options
    return items
      .filter(item => item.productId === product._id)
      .reduce((total, item) => total + item.quantity, 0);
  }, [items, product]);
  
  // Calculate current quantity in cart for this product with current grind option
  const currentCartQuantityForGrind = useMemo(() => {
    if (!product || !grindOption) return 0;
    
    // Find quantity for this product with specific grind option
    const item = items.find(item => 
      item.productId === product._id && 
      item.grindOption === grindOption
    );
    
    return item ? item.quantity : 0;
  }, [items, product, grindOption]);

  // Calculate available inventory (total inventory minus what's already in cart)
  const availableInventory = useMemo(() => {
    if (!product) return 0;
    return Math.max(0, product.inventory_count - currentCartQuantity);
  }, [product, currentCartQuantity]);

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (product) {
      if (newQuantity > availableInventory) {
        if (currentCartQuantity > 0) {
          setQuantityError(`Sorry, only ${availableInventory} more available (${currentCartQuantity} already in cart)`);
        } else {
          setQuantityError(`Sorry, only ${product.inventory_count} available in stock`);
        }
      } else {
        setQuantityError('');
        setQuantity(newQuantity);
      }
    }
  };
  
  // Handle grind option change
  const handleGrindOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrindOption(e.target.value);
    if (e.target.value) {
      setGrindOptionError('');
    }
  };
  
  // Handle add to cart functionality
  const handleAddToCart = () => {
    // Reset any previous errors
    setAuthError('');
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setAuthError('You need to login to add items to cart');
      return;
    }
    
    // Validate required fields
    if (!grindOption) {
      setGrindOptionError('Please select a grind option');
      return;
    }
    
    if (quantityError) {
      return;
    }
    
    // Validate against available inventory one more time before adding
    if (product && quantity > availableInventory) {
      setQuantityError(`Cannot add ${quantity} items. Only ${availableInventory} more available.`);
      return;
    }
    
    if (product && quantity > 0) {
      setAddingToCart(true);
      
      // Simulate a short delay as if processing
      setTimeout(() => {
        // Get existing item with same product and grind option
        const existingItem = items.find(item => 
          item.productId === product._id && 
          item.grindOption === grindOption
        );
        
        // Calculate final quantity by adding current selection to what's already in cart
        const finalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
        
        // Add the product to cart
        addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: finalQuantity,
          grindOption: grindOption,
          imageUrl: `/web-images/product-images/${product._id}.jpg`,
        });
        
        // Show success message
        setAddToCartSuccess(true);
        setAddingToCart(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setAddToCartSuccess(false);
        }, 3000);
      }, 500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-amber-50">
      <Link 
        href="/products" 
        className="flex items-center text-amber-700 hover:text-amber-800 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Products
      </Link>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-amber-200 h-12 w-12 mb-4"></div>
            <div className="text-amber-800">Loading product details...</div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center justify-center">
          <svg className="h-5 w-5 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
      
      {/* Product Details */}
      {!isLoading && !error && product && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/3 h-48 relative bg-amber-100">
              <img
                src={`/web-images/product-images/${product._id}.jpg`}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Try different extensions if jpg fails
                  const extensions = ['.webp', '.jpeg', '.png'];
                  const imgElement = e.currentTarget;
                  const baseId = product._id;
                  
                  const currentSrc = imgElement.src;
                  const attemptCount = imgElement.getAttribute('data-attempt') || '0';
                  const currentAttempt = parseInt(attemptCount, 10);
                  
                  if (currentAttempt < extensions.length) {
                    imgElement.setAttribute('data-attempt', (currentAttempt + 1).toString());
                    imgElement.src = `/web-images/product-images/${baseId}${extensions[currentAttempt]}`;
                  } else {
                    imgElement.onerror = null; // prevent further error handling
                    imgElement.style.display = 'none';
                    imgElement.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    const fallback = document.createElement('span');
                    fallback.className = 'text-amber-700';
                    fallback.textContent = 'No image available';
                    imgElement.parentElement?.appendChild(fallback);
                  }
                }}
              />
            </div>
            
            {/* Product Info */}
            <div className="md:w-2/3 p-4">
              <div className="uppercase tracking-wide text-sm text-amber-500 font-semibold">
                {product.origin_country} • {product.roast_level} Roast
              </div>
              
              <h1 className="mt-2 text-3xl font-bold text-amber-900">
                {product.name}
              </h1>
              
              <div className="mt-2 text-xl text-amber-700 font-semibold">
                {formatPrice(product.price)}
              </div>
              
              <div className="mt-3 border-t border-gray-200 pt-2">
                <h2 className="text-sm font-bold text-gray-800">Description</h2>
                <p className="mt-1 text-gray-700 text-sm line-clamp-2">{product.description}</p>
              </div>
              
              <div className="mt-2 border-t border-gray-200 pt-2">
                <h2 className="text-sm font-bold text-gray-800">Farm Information</h2>
                <p className="mt-1 text-gray-700 text-sm line-clamp-2">{product.farm_info || "Information not available"}</p>
              </div>
              
              {/* Product Specifications */}
              <div className="mt-2 border-t border-gray-200 pt-2">
                <h2 className="text-sm font-bold text-gray-800">Details</h2>
                <dl className="mt-1 space-y-0.5">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-bold text-gray-800">Origin</dt>
                    <dd className="text-sm text-gray-700 col-span-2">{product.origin_country}</dd>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-bold text-gray-800">Elevation</dt>
                    <dd className="text-sm text-gray-700 col-span-2">{product.elevation} meters</dd>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-bold text-gray-800">Processing</dt>
                    <dd className="text-sm text-gray-700 col-span-2">{product.processing_method}</dd>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-bold text-gray-800">Roast Level</dt>
                    <dd className="text-sm text-gray-700 col-span-2">{product.roast_level}</dd>
                  </div>
                </dl>
              </div>

              {/* Tasting Notes */}
              {product.tasting_notes && product.tasting_notes.length > 0 && (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <h2 className="text-sm font-bold text-gray-800 mb-1">Tasting Notes</h2>
                  <div className="flex flex-wrap gap-1">
                    {product.tasting_notes.map((note, index) => (
                      <span 
                        key={index} 
                        className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity Selector */}
              <div className="mt-2 border-t border-gray-200 pt-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-gray-800">Quantity {currentCartQuantity > 0 && <span className="font-normal text-amber-600 text-xs ml-1">(Already in cart: {currentCartQuantity})</span>}</h2>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-1 border border-gray-300 rounded-l-md hover:bg-gray-100 disabled:opacity-50 text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.inventory_count}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-12 text-center border-t border-b border-gray-300 p-1 text-black"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={availableInventory <= quantity}
                      className="p-1 border border-gray-300 rounded-r-md hover:bg-gray-100 disabled:opacity-50 text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                {quantityError && (
                  <p className="mt-1 text-sm text-red-600">{quantityError}</p>
                )}
                {!quantityError && availableInventory > 0 && (
                  <p className="mt-1 text-xs text-gray-600">In stock: {product.inventory_count} {currentCartQuantity > 0 && `(${availableInventory} available to add)`}</p>
                )}
                {availableInventory === 0 && (
                  <p className="mt-1 text-xs text-red-600">Maximum quantity already in cart</p>
                )}
              </div>
              
              {/* Grind Options */}
              <div className="mt-2 border-t border-gray-200 pt-2">
                <h2 className="text-sm font-bold text-gray-800 mb-1">Grind Option</h2>
                <select
                  value={grindOption}
                  onChange={handleGrindOptionChange}
                  className={`block w-full rounded-md border ${!grindOption && 'border-red-300'} border-gray-300 py-1 px-3 text-sm text-black focus:outline-none focus:ring-amber-500 focus:border-amber-500`}
                >
                  <option value="" disabled>Select a grind option</option>
                  {VALID_GRIND_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Add to Cart Button */}
              <div className="mt-2">
                {grindOptionError && (
                  <p className="text-sm text-red-600 mb-1">{grindOptionError}</p>
                )}
                {authError && (
                  <div className="mb-2 bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded flex items-center text-sm">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {authError}
                    <button 
                      className="ml-2 underline text-red-800 hover:text-red-900" 
                      onClick={() => router.push('/login')}
                    >
                      Login now
                    </button>
                  </div>
                )}
                {addToCartSuccess && (
                  <div className="mb-2 bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded flex items-center text-sm">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to cart!
                  </div>
                )}
                <button 
                  className="w-full bg-amber-700 text-white py-1.5 px-4 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:ring-offset-1 transition-colors duration-300 flex items-center justify-center text-sm"
                  disabled={availableInventory === 0 || addingToCart}
                  onClick={handleAddToCart}
                >
                  {addingToCart ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {availableInventory > 0 ? 'Add to Cart' : (product.inventory_count > 0 ? 'Maximum in Cart' : 'Out of Stock')}
                    </>
                  )}
                </button>
                <div className="flex justify-center mt-2">
                  <button 
                    onClick={() => router.push('/cart')} 
                    className="text-amber-700 text-sm hover:underline flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}