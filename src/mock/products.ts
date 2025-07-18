import { Product, Order, PaymentStatus, OrderStatus } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Powder',
    description: 'Premium whey protein for muscle building and recovery',
    price: 49.99,
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
    stock: 25,
    sku: 'WPP-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Gym Tank Top',
    description: 'Moisture-wicking tank top for intense workouts',
    price: 24.99,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    stock: 40,
    sku: 'GTT-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Resistance Bands Set',
    description: 'Complete set of resistance bands for strength training',
    price: 34.99,
    category: 'equipment',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    stock: 15,
    sku: 'RBS-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Water Bottle',
    description: 'Insulated stainless steel water bottle',
    price: 19.99,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&h=300&fit=crop',
    stock: 30,
    sku: 'WB-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Pre-Workout Energy Drink',
    description: 'Natural energy boost for your workout',
    price: 3.99,
    category: 'beverages',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop',
    stock: 50,
    sku: 'PRED-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Protein Bar',
    description: 'High-protein snack bar with natural ingredients',
    price: 2.99,
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1571506165871-823e7ccac4e2?w=300&h=300&fit=crop',
    stock: 75,
    sku: 'PB-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Creatine Monohydrate',
    description: 'Pure creatine monohydrate for strength and power',
    price: 29.99,
    category: 'supplements',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
    stock: 20,
    sku: 'CM-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'Gym Shorts',
    description: 'Comfortable athletic shorts for training',
    price: 32.99,
    category: 'apparel',
    image: 'https://images.unsplash.com/photo-1506629905607-c28b47bb4865?w=300&h=300&fit=crop',
    stock: 35,
    sku: 'GS-001',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    items: [
      { product: mockProducts[0], quantity: 1 },
      { product: mockProducts[3], quantity: 2 }
    ],
    subtotal: 89.97,
    tax: 7.20,
    total: 97.17,
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    orderStatus: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'staff-001',
    notes: 'Member purchase'
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    items: [
      { product: mockProducts[4], quantity: 3 },
      { product: mockProducts[5], quantity: 2 }
    ],
    subtotal: 17.95,
    tax: 1.44,
    total: 19.39,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    orderStatus: 'completed',
    createdAt: '2024-01-15T14:20:00Z',
    createdBy: 'staff-002',
    notes: 'Walk-in customer'
  }
];