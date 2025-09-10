"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProductImageUrl, handleImageError } from '../../utils/imageLoader';

// Define Product type based on backend model
type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  origin_country: string;
  roast_level: string;
  tasting_notes: string[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/api/products/all_products`);
        
        if (!response.ok) {
          throw new Error('Failed to load products');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-amber-50">
      <h1 className="text-3xl font-bold text-amber-900 mb-8 text-center">
        Our Coffee Selection
      </h1>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-amber-200 h-12 w-12 mb-4"></div>
            <div className="text-amber-800">Loading products...</div>
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
      
      {/* No Products State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-amber-200">
          <p className="text-xl text-amber-800">No products available at this time</p>
        </div>
      )}
      
      {/* Products Grid */}
      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-amber-100 hover:shadow-lg transition-shadow duration-300 max-w-sm mx-auto">
              {/* Product Image */}
              <div className="relative h-52 w-full overflow-hidden bg-amber-100">
                {/* Use local image paths from public/web-images directory */}
                <img
                  src={getProductImageUrl(product._id)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => handleImageError(e, product._id)}
                />
              </div>
              
              {/* Product Info */}
              <div className="p-4">
                <h2 className="text-xl font-bold text-amber-900 mb-2">{product.name}</h2>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-amber-700">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    {product.roast_level}
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm text-gray-600">Origin: </span>
                  <span className="text-gray-800">{product.origin_country}</span>
                </div>
                                
                {product.tasting_notes && product.tasting_notes.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 block mb-1">Tasting Notes:</span>
                    <div className="flex flex-wrap gap-1">
                      {product.tasting_notes.map((note, index) => (
                        <span key={index} className="inline-block bg-amber-50 text-amber-700 px-2 py-1 text-xs rounded">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <Link 
                  href={`/products/${product._id}`} 
                  className="block text-center bg-amber-700 text-white py-2 px-4 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}