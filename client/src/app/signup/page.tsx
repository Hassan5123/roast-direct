"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  
  const API_BASE_URL = 'http://localhost:5001';
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error when user modifies any field
    if (apiError) {
      setApiError('');
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    };
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
      isValid = false;
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      // Try to parse response as JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON can't be parsed
        throw new Error('Unable to connect to the server. Please try again later.');
      }
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('An account with this email already exists. Please use a different email or try logging in.');
        } else if (response.status === 400) {
          throw new Error('Please check your information and try again. All fields are required.');
        } else if (response.status === 404) {
          throw new Error('The registration service is currently unavailable. Please try again later.');
        } else {
          throw new Error(data.error || 'Unable to create account. Please try again later.');
        }
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to products page after successful registration
      router.push('/products');
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-amber-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-6 text-center">
          Create an Account
        </h1>
        
        {/* Form card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-amber-100">
          <div className="p-8">
            {/* API error message */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-center">
                <svg className="h-5 w-5 text-red-600 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-medium">{apiError}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* First Name */}
              <div className="mb-4">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-800 ${errors.first_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-amber-200'}`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div className="mb-4">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-800 ${errors.last_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-amber-200'}`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-800 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-amber-200'}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Password */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-800 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-amber-200'}`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-700 text-white py-2 px-4 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600">
              Already have an account? <Link href="/login" className="text-amber-700 hover:text-amber-800 font-semibold">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}