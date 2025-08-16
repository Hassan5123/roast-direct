"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../utils/cartContext';
import { useAuth } from '../../utils/authContext';

export default function ReviewPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, checkingAuth, user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState<{
    subtotal: number;
    tax_amount: number;
    tax_rate: number;
    shipping_cost: number;
    final_total: number;
  } | null>(null);
  
  const API_BASE_URL = 'http://localhost:5001';

  // Initialize client-side rendering indicator
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, checkingAuth, router]);

  // Redirect to cart if no items in cart
  useEffect(() => {
    if (isClient && items.length === 0) {
      router.push('/cart');
    }
  }, [isClient, items, router]);

  // Fetch order totals when component mounts
  useEffect(() => {
    if (isClient && items.length > 0) {
      calculateOrderTotals();
    }
  }, [isClient, items]);

  // Calculate order totals using API
  const calculateOrderTotals = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      // Get form data from localStorage (set by checkout page)
      const checkoutFormData = localStorage.getItem('checkoutFormData');
      if (!checkoutFormData) {
        router.push('/checkout');
        return;
      }
      
      const formData = JSON.parse(checkoutFormData);
      const subtotal = getCartTotal();
      
      // Prepare shipping and billing addresses
      const shippingAddress = {
        street: formData.shippingAddress,
        city: formData.shippingCity,
        state: formData.shippingState,
        zip: formData.shippingZip
      };
      
      const billingAddress = formData.sameAsShipping
        ? shippingAddress
        : {
            street: formData.billingAddress,
            city: formData.billingCity,
            state: formData.billingState,
            zip: formData.billingZip
          };
      
      // Call the API to calculate final totals
      const currentYear = new Date().getFullYear();
      // Convert 2-digit year to 4-digit year
      let fullYear = parseInt(formData.expYear);
      if (fullYear < 100) {
        fullYear = 2000 + fullYear;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/orders/final_total`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subtotal,
          card_number: formData.cardNumber.replace(/\s+/g, ''),
          cardholder_name: formData.cardholderName,
          cvc: formData.cvc,
          exp_month: parseInt(formData.expMonth),
          exp_year: fullYear,
          shipping_address: shippingAddress,
          billing_address: billingAddress
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to calculate order totals');
        if (errorData.details) {
          (error as any).details = errorData.details;
        }
        throw error;
      }
      
      const data = await response.json();
      setOrderDetails(data);
    } catch (error: any) {
      console.error('Error calculating order totals:', error);
      // Extract detailed error message if available
      let errorMessage = 'Failed to calculate order totals. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle validation error details if available
      if (error.details) {
        errorMessage = `${errorMessage} (${error.details.join(', ')})`;
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      // Get form data from localStorage
      const checkoutFormData = localStorage.getItem('checkoutFormData');
      if (!checkoutFormData || !orderDetails) {
        setError('Missing order information. Please go back to checkout.');
        return;
      }
      
      const formData = JSON.parse(checkoutFormData);
      
      // Prepare shipping address
      const shippingAddress = {
        street: formData.shippingAddress,
        city: formData.shippingCity,
        state: formData.shippingState,
        zip: formData.shippingZip
      };
      
      // Prepare items for the API call
      const orderItems = items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: item.price,
        grind_option: item.grindOption || 'Whole Bean'
      }));
      
      // Make the API call to place the order
      const response = await fetch(`${API_BASE_URL}/api/orders/place_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          items: orderItems,
          shipping_address: shippingAddress,
          final_total: orderDetails.final_total
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }
      
      const data = await response.json();
      
      // Clear the cart and localStorage
      clearCart();
      localStorage.removeItem('checkoutFormData');
      
      // Display success message first, then redirect
      setError('');
      setSuccessMessage('Order placed successfully! Redirecting to orders page...');
      
      // Use timeout for redirect after state update
      setTimeout(() => {
        router.push('/orders');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToCheckout = () => {
    router.push('/checkout');
  };

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Placed!</h2>
          <p className="text-gray-600 mb-6">{successMessage}</p>
          <div className="animate-pulse flex justify-center">
            <div className="h-2 w-16 bg-amber-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isClient || checkingAuth || isProcessing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
        <div className="animate-pulse flex flex-col items-center p-12">
          <div className="rounded-full bg-amber-200 h-12 w-12 mb-4"></div>
          <div className="text-amber-800">Processing your order...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">Review Order</h1>
          
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleBackToCheckout}
              className="bg-amber-600 text-white py-2 px-6 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Review Order</h1>
        
        {/* Order Items */}
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200 mb-6">
          {items.map((item) => (
            <div key={`${item.productId}-${item.grindOption}`} className="p-4 flex items-start">
              {/* Item Image */}
              <div className="w-16 h-16 bg-amber-100 rounded-md overflow-hidden mr-4">
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
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-gray-500 text-sm">Grind: {item.grindOption}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-700">{item.quantity} x {formatPrice(item.price)}</span>
                  <span className="font-medium text-amber-800">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="bg-amber-50 p-6 rounded-md border border-amber-100 mb-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">Order Summary</h2>
          
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{orderDetails ? formatPrice(orderDetails.subtotal) : formatPrice(getCartTotal())}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Tax ({orderDetails ? `${orderDetails.tax_rate}%` : '?%'})</span>
              <span>{orderDetails ? formatPrice(orderDetails.tax_amount) : '-'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{orderDetails ? formatPrice(orderDetails.shipping_cost) : '-'}</span>
            </div>
            
            <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between font-bold text-amber-900">
              <span>Total</span>
              <span>{orderDetails ? formatPrice(orderDetails.final_total) : '-'}</span>
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <button
            onClick={handleBackToCheckout}
            className="md:w-1/2 bg-white border border-amber-700 text-amber-700 py-3 px-6 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300"
          >
            Back to Checkout
          </button>
          
          <button
            onClick={handlePlaceOrder}
            className="md:w-1/2 bg-amber-700 text-white py-3 px-6 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}