"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../utils/cartContext';
import { useAuth } from '../../utils/authContext';

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, checkingAuth, user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: '',
    cardholderName: '',
    cvc: '',
    expMonth: '',
    expYear: '',
    
    // Shipping address
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    phone: '',
    
    // Billing address
    sameAsShipping: true,
    billingName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: ''
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    setIsClient(true);
    // Fetch subtotal from API when component loads
    fetchSubtotal();
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

  const fetchSubtotal = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/subtotal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subtotal');
      }
      
      const data = await response.json();
      setSubtotal(data.subtotal || getCartTotal());
    } catch (error) {
      console.error('Error fetching subtotal:', error);
      // Fallback to client-side calculation if API call fails
      setSubtotal(getCartTotal());
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isCheckbox = type === 'checkbox';
    const fieldValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // If "same as shipping" is checked, copy shipping to billing
    if (name === 'sameAsShipping' && fieldValue === true) {
      setFormData(prev => ({
        ...prev,
        billingName: formData.cardholderName,
        billingAddress: prev.shippingAddress,
        billingCity: prev.shippingCity,
        billingState: prev.shippingState,
        billingZip: prev.shippingZip
      }));
    }
    
    // Clear error for this field when value changes
    if (formErrors[name]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Validate form before submission
  const handleReviewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError('');
    
    // Basic form validation - check for empty fields
    const errors: Record<string, string> = {};
    
    // Validate card details
    if (!formData.cardNumber.trim()) errors.cardNumber = "Card number is required";
    if (!formData.cardholderName.trim()) errors.cardholderName = "Cardholder name is required";
    if (!formData.cvc.trim()) errors.cvc = "CVC is required";
    if (!formData.expMonth.trim()) errors.expMonth = "Expiration month is required";
    if (!formData.expYear.trim()) errors.expYear = "Expiration year is required";
    
    // Validate shipping address
    if (!formData.shippingAddress.trim()) errors.shippingAddress = "Shipping address is required";
    if (!formData.shippingCity.trim()) errors.shippingCity = "City is required";
    if (!formData.shippingState.trim()) errors.shippingState = "State is required";
    if (!formData.shippingZip.trim()) errors.shippingZip = "ZIP code is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    
    // Validate billing address if not same as shipping
    if (!formData.sameAsShipping) {
      if (!formData.billingName.trim()) errors.billingName = "Billing name is required";
      if (!formData.billingAddress.trim()) errors.billingAddress = "Billing address is required";
      if (!formData.billingCity.trim()) errors.billingCity = "Billing city is required";
      if (!formData.billingState.trim()) errors.billingState = "Billing state is required";
      if (!formData.billingZip.trim()) errors.billingZip = "Billing ZIP code is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // All fields are valid, proceed to review order
    router.push('/review');
  };

  if (!isClient || checkingAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
        <div className="animate-pulse flex flex-col items-center p-12">
          <div className="rounded-full bg-amber-200 h-12 w-12 mb-4"></div>
          <div className="text-amber-800">Loading checkout...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-amber-50">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Checkout</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items Summary - Left Column */}
          <div>
            <h2 className="text-xl font-semibold text-amber-900 mb-4">Order Summary</h2>
            
            <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
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
            
            {/* Order Subtotal */}
            <div className="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-lg font-medium text-gray-800">Subtotal</span>
              <span className="text-xl font-bold text-amber-900">{formatPrice(subtotal)}</span>
            </div>
          </div>
          
          {/* Checkout Form - Right Column */}
          <div>
            <form onSubmit={handleReviewOrder} className="space-y-6">
              {/* Card Details */}
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="text-lg font-medium text-amber-900 mb-4">Card Details</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className={`w-full p-2 border ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                    />
                    {formErrors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cardNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleChange}
                      className={`w-full p-2 border ${formErrors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                    />
                    {formErrors.cardholderName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cardholderName}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label htmlFor="expMonth" className="block text-sm font-medium text-gray-700 mb-1">
                        Month
                      </label>
                      <select
                        id="expMonth"
                        name="expMonth"
                        value={formData.expMonth}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.expMonth ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month.toString().padStart(2, '0')}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      {formErrors.expMonth && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.expMonth}</p>
                      )}
                    </div>
                    
                    <div className="col-span-1">
                      <label htmlFor="expYear" className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <select
                        id="expYear"
                        name="expYear"
                        value={formData.expYear}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.expYear ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      >
                        <option value="">YY</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <option key={year} value={year.toString().slice(-2)}>
                            {year.toString().slice(-2)}
                          </option>
                        ))}
                      </select>
                      {formErrors.expYear && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.expYear}</p>
                      )}
                    </div>
                    
                    <div className="col-span-1">
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.cvc ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                        placeholder="•••"
                        maxLength={4}
                      />
                      {formErrors.cvc && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.cvc}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h3 className="text-lg font-medium text-amber-900 mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      className={`w-full p-2 border ${formErrors.shippingAddress ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                    />
                    {formErrors.shippingAddress && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.shippingAddress}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="shippingCity"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.shippingCity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      />
                      {formErrors.shippingCity && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.shippingCity}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="shippingState" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="shippingState"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className={`w-full p-2 border ${formErrors.shippingState ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      />
                      {formErrors.shippingState && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.shippingState}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shippingZip" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="shippingZip"
                        name="shippingZip"
                        value={formData.shippingZip}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.shippingZip ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      />
                      {formErrors.shippingZip && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.shippingZip}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Billing Address */}
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-medium text-amber-900">Billing Address</h3>
                  <div className="ml-auto flex items-center">
                    <input
                      type="checkbox"
                      id="sameAsShipping"
                      name="sameAsShipping"
                      checked={formData.sameAsShipping}
                      onChange={handleChange}
                      className="h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAsShipping" className="ml-2 text-sm text-gray-700">
                      Same as shipping
                    </label>
                  </div>
                </div>
                
                {!formData.sameAsShipping && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="billingName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="billingName"
                        name="billingName"
                        value={formData.billingName}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.billingName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      />
                      {formErrors.billingName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.billingName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.billingAddress ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      />
                      {formErrors.billingAddress && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.billingAddress}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="billingCity"
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleChange}
                          className={`w-full p-2 border ${formErrors.billingCity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                        />
                        {formErrors.billingCity && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.billingCity}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          id="billingState"
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleChange}
                          placeholder="Enter state"
                          className={`w-full p-2 border ${formErrors.billingState ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                        />
                        {formErrors.billingState && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.billingState}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="billingZip"
                        name="billingZip"
                        value={formData.billingZip}
                        onChange={handleChange}
                        className={`w-full p-2 border ${formErrors.billingZip ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring focus:ring-amber-200 focus:border-amber-500 outline-none text-black`}
                      />
                      {formErrors.billingZip && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.billingZip}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 space-y-4">
                <button
                  type="button"
                  onClick={() => router.push('/cart')}
                  className="w-full bg-white border border-amber-700 text-amber-700 py-2 px-4 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300"
                >
                  Back to Cart
                </button>
                
                <button
                  type="submit"
                  className="w-full bg-amber-700 text-white py-3 px-6 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300"
                >
                  Review Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}