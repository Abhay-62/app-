import { CartItem, Product } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const [CartProvider, useCart] = createContextHook(() => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      console.log('Loaded cart from storage:', storedCart);
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (cartItems: CartItem[]) => {
    try {
      console.log('Saving cart to storage:', cartItems);
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      // Add a small delay to ensure data is properly saved
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = useCallback((product: Product, quantity: number, pickupAddress: string, deliveryAddress: string, pickupTime: string, notes?: string) => {
    const cartItem: CartItem = {
      _id: Date.now().toString(),
      productId: product._id,
      product,
      quantity,
      notes,
      pickupAddress,
      deliveryAddress,
      pickupTime,
    };

    const updatedItems = [...items, cartItem];
    console.log('Adding item to cart:', cartItem);
    setItems(updatedItems);
    saveCart(updatedItems);
  }, [items]);

  const removeFromCart = useCallback((itemId: string) => {
    const updatedItems = items.filter(item => item._id !== itemId);
    setItems(updatedItems);
    saveCart(updatedItems);
  }, [items]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const updatedItems = items.map(item =>
      item._id === itemId ? { ...item, quantity } : item
    );
    setItems(updatedItems);
    saveCart(updatedItems);
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
    AsyncStorage.removeItem('cart');
  }, []);

  const getTotalAmount = useCallback(() => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  // Add a refresh function to force reload cart from storage
  const refreshCart = useCallback(async () => {
    console.log('Refreshing cart from storage...');
    // Add a small delay to ensure data is properly saved
    await new Promise(resolve => setTimeout(resolve, 150));
    await loadCart();
  }, []);

  return useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getItemCount,
    refreshCart
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalAmount, getItemCount, refreshCart]);
});