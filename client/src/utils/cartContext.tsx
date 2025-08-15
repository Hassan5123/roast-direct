"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  grindOption: string;
  imageUrl: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, grindOption: string) => void;
  updateQuantity: (productId: string, grindOption: string, quantity: number) => boolean;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('roastDirectCart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('roastDirectCart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => 
        item.productId === newItem.productId && item.grindOption === newItem.grindOption
      );
      
      if (existingItemIndex > -1) {
        // Update quantity if item already exists with same grind option
        const updatedItems = [...currentItems];
        // Use the provided quantity directly (not adding to existing)
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newItem.quantity
        };
        return updatedItems;
      } else {
        // Add new item
        return [...currentItems, newItem];
      }
    });
  };

  const removeFromCart = (productId: string, grindOption: string) => {
    setItems(currentItems => currentItems.filter(item => 
      !(item.productId === productId && item.grindOption === grindOption)
    ));
  };

  const updateQuantity = (productId: string, grindOption: string, quantity: number): boolean => {
    if (quantity < 1) return false;

    setItems(currentItems => 
      currentItems.map(item => 
        (item.productId === productId && item.grindOption === grindOption) ? { ...item, quantity } : item
      )
    );
    return true;
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}