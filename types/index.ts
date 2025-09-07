export interface User {
  _id: string;
  mobile: string;
  name: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
}

export interface CartItem {
  _id: string;
  productId: string;
  product: Product;
  quantity: number;
  notes?: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupTime: string;
}

export interface Order {
  _id: string;
  orderId: string;
  pickupId: string;
  deliveryId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'picked-up' | 'in-progress' | 'ready' | 'delivered' | 'cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  pickupTime: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  aadhar: string;
  mobile: string;
  role: string;
  isActive: boolean;
}

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  services: string[];
  isActive: boolean;
}

export interface Admin {
  _id: string;
  email: string;
  name: string;
  role: string;
}

export interface Counter {
  _id: string;
  name: string;
  value: number;
}