export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentMethod = 'orange_money' | 'mtn_momo' | 'cash';

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  prepTime: number;
  isTop?: boolean;
  available: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  createdAt: string;
  estimatedTime: number;
  phoneNumber?: string;
}

export interface AdminSettings {
  restaurantName: string;
  tableCount: number;
  paymentMethods: {
    orange_money: boolean;
    mtn_momo: boolean;
    cash: boolean;
  };
  adminPassword: string;
}
