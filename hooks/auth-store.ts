import { Admin, Order, User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedAdmin = await AsyncStorage.getItem('admin');
      const storedOrders = await AsyncStorage.getItem('userOrders');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
      if (storedOrders) {
        setUserOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserOrders = async (orders: Order[]) => {
    try {
      console.log('Saving user orders to storage:', orders);
      await AsyncStorage.setItem('userOrders', JSON.stringify(orders));
      setUserOrders(orders);
    } catch (error) {
      console.error('Error saving user orders:', error);
    }
  };

  const loginUser = useCallback(async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const loginAdmin = useCallback(async (adminData: Admin) => {
    setAdmin(adminData);
    await AsyncStorage.setItem('admin', JSON.stringify(adminData));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setAdmin(null);
    setUserOrders([]);
    await AsyncStorage.multiRemove(['user', 'admin', 'userOrders']);
    router.replace('/login');
  }, []);

  const updateUser = useCallback(async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const addOrder = useCallback(async (order: Order) => {
    console.log('Adding order to user orders:', order);
    const updatedOrders = [order, ...userOrders];
    await saveUserOrders(updatedOrders);
  }, [userOrders]);

  return useMemo(() => ({
    user,
    admin,
    userOrders,
    isLoading,
    loginUser,
    loginAdmin,
    logout,
    updateUser,
    addOrder,
    isAuthenticated: !!user || !!admin,
    isAdmin: !!admin,
  }), [user, admin, userOrders, isLoading, loginUser, loginAdmin, logout, updateUser, addOrder]);
});