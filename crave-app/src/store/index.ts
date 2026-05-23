import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem, CartItem, Order, OrderStatus, PaymentMethod, AdminSettings } from '../types';
import { INITIAL_MENU } from '../data/menu';
import { generateOrderId } from '../lib/utils';

const SEED_ORDERS: Order[] = [
  {
    id: 'CRV-44192',
    tableNumber: 12,
    items: [{ menuItem: INITIAL_MENU[0], quantity: 1, note: '' }],
    status: 'preparing',
    paymentMethod: 'cash',
    total: 4500,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    estimatedTime: 14,
  },
  {
    id: 'CRV-31042',
    tableNumber: 5,
    items: [
      { menuItem: INITIAL_MENU[1], quantity: 2, note: 'Sans oignons' },
      { menuItem: INITIAL_MENU[3], quantity: 2, note: '' },
    ],
    status: 'ready',
    paymentMethod: 'orange_money',
    total: 14000,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    estimatedTime: 14,
    phoneNumber: '655123456',
  },
  {
    id: 'CRV-28831',
    tableNumber: 8,
    items: [
      { menuItem: INITIAL_MENU[0], quantity: 1, note: '' },
      { menuItem: INITIAL_MENU[6], quantity: 2, note: '' },
    ],
    status: 'served',
    paymentMethod: 'mtn_momo',
    total: 6100,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    estimatedTime: 13,
    phoneNumber: '677654321',
  },
  {
    id: 'CRV-19210',
    tableNumber: 3,
    items: [{ menuItem: INITIAL_MENU[9], quantity: 2, note: '' }],
    status: 'served',
    paymentMethod: 'cash',
    total: 5000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedTime: 7,
  },
  {
    id: 'CRV-10031',
    tableNumber: 15,
    items: [
      { menuItem: INITIAL_MENU[2], quantity: 1, note: '' },
      { menuItem: INITIAL_MENU[4], quantity: 1, note: '' },
      { menuItem: INITIAL_MENU[7], quantity: 1, note: '' },
    ],
    status: 'cancelled',
    paymentMethod: 'orange_money',
    total: 7000,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    estimatedTime: 15,
    phoneNumber: '699111222',
  },
];

interface StoreState {
  menuItems: MenuItem[];
  cart: CartItem[];
  tableNumber: number | null;
  orders: Order[];
  isAdminAuthenticated: boolean;
  settings: AdminSettings;

  setTable: (num: number) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getEstimatedTime: () => number;

  placeOrder: (method: PaymentMethod, phone?: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;

  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  updateMenuItem: (item: MenuItem) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  deleteMenuItem: (id: string) => void;
  updateSettings: (s: Partial<AdminSettings>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      menuItems: INITIAL_MENU,
      cart: [],
      tableNumber: null,
      orders: SEED_ORDERS,
      isAdminAuthenticated: false,
      settings: {
        restaurantName: 'Crave',
        tableCount: 24,
        paymentMethods: { orange_money: true, mtn_momo: true, cash: true },
        adminPassword: 'admin123',
      },

      setTable: (num) => set({ tableNumber: num, cart: [] }),

      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find((ci) => ci.menuItem.id === item.id);
        if (existing) {
          set({ cart: cart.map((ci) => ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci) });
        } else {
          set({ cart: [...cart, { menuItem: item, quantity: 1, note: '' }] });
        }
      },

      removeFromCart: (itemId) => set({ cart: get().cart.filter((ci) => ci.menuItem.id !== itemId) }),

      updateQuantity: (itemId, delta) => {
        set({ cart: get().cart.map((ci) => ci.menuItem.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci).filter((ci) => ci.quantity > 0) });
      },

      updateNote: (itemId, note) => {
        set({ cart: get().cart.map((ci) => ci.menuItem.id === itemId ? { ...ci, note } : ci) });
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => get().cart.reduce((s, ci) => s + ci.menuItem.price * ci.quantity, 0),

      getCartCount: () => get().cart.reduce((s, ci) => s + ci.quantity, 0),

      getEstimatedTime: () => {
        const { cart } = get();
        if (!cart.length) return 0;
        return Math.max(...cart.map((ci) => ci.menuItem.prepTime)) + 2;
      },

      placeOrder: (method, phone) => {
        const { cart, tableNumber, getCartTotal, getEstimatedTime } = get();
        const order: Order = {
          id: generateOrderId(),
          tableNumber: tableNumber!,
          items: [...cart],
          status: 'preparing',
          paymentMethod: method,
          total: getCartTotal(),
          createdAt: new Date().toISOString(),
          estimatedTime: getEstimatedTime(),
          phoneNumber: phone,
        };
        set((s) => ({ orders: [order, ...s.orders], cart: [] }));
        return order;
      },

      updateOrderStatus: (orderId, status) => {
        set({ orders: get().orders.map((o) => o.id === orderId ? { ...o, status } : o) });
      },

      getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),

      adminLogin: (password) => {
        if (password === get().settings.adminPassword) { set({ isAdminAuthenticated: true }); return true; }
        return false;
      },

      adminLogout: () => set({ isAdminAuthenticated: false }),

      updateMenuItem: (item) => set({ menuItems: get().menuItems.map((m) => m.id === item.id ? item : m) }),

      addMenuItem: (item) => set({ menuItems: [...get().menuItems, { ...item, id: `custom-${Date.now()}` }] }),

      deleteMenuItem: (id) => set({ menuItems: get().menuItems.filter((m) => m.id !== id) }),

      updateSettings: (s) => set({ settings: { ...get().settings, ...s } }),
    }),
    {
      name: 'crave-storage',
      partialize: (s) => ({
        menuItems: s.menuItems,
        orders: s.orders,
        isAdminAuthenticated: s.isAdminAuthenticated,
        settings: s.settings,
        tableNumber: s.tableNumber,
        cart: s.cart,
      }),
    }
  )
);
