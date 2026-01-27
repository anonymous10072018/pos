
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}

export interface Category {
  id: number;
  category: string;
}

export interface Branch {
  id: number;
  branchCode: string;
  dateInserted?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  priceAtSale: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  timestamp: number;
}

export type ViewState = 'register' | 'inventory' | 'reports' | 'dashboard' | 'fast-service';

export type ThemeColor = 'orange' | 'blue' | 'emerald' | 'purple' | 'rose' | 'slate';

export interface AppConfig {
  storeName: string;
  themeColor: ThemeColor;
  themeMode: 'light' | 'dark';
}

export interface BusinessStats {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  topProducts: { name: string; count: number }[];
}
