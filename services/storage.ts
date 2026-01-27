
import { Product, Sale, ThemeColor } from '../types';

const LOCAL_KEYS = {
  PRODUCTS: 'swiftpos_products',
  SALES: 'swiftpos_sales',
  CATEGORIES: 'swiftpos_categories',
  THEME: 'swiftpos_theme',
  COLOR: 'swiftpos_color',
  STORE_NAME: 'swiftpos_store_name'
};

const INITIAL_CATEGORIES = ["Beverage", "Snacks", "Food", "Electronics", "Groceries"];

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Premium Coffee', 
    price: 45, 
    category: 'Beverage', 
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200'
  },
  { 
    id: '2', 
    name: 'Fresh Croissant', 
    price: 35, 
    category: 'Food', 
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=200'
  }
];

export const StorageService = {
  loadProducts: (): Product[] => {
    const data = localStorage.getItem(LOCAL_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(LOCAL_KEYS.PRODUCTS, JSON.stringify(products));
  },

  loadSales: (): Sale[] => {
    const data = localStorage.getItem(LOCAL_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },

  saveSales: (sales: Sale[]) => {
    localStorage.setItem(LOCAL_KEYS.SALES, JSON.stringify(sales));
  },

  loadCategories: (): string[] => {
    const data = localStorage.getItem(LOCAL_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  },

  saveCategories: (categories: string[]) => {
    localStorage.setItem(LOCAL_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem(LOCAL_KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(LOCAL_KEYS.THEME, theme);
  },

  getThemeColor: (): ThemeColor => {
    return (localStorage.getItem(LOCAL_KEYS.COLOR) as ThemeColor) || 'orange';
  },

  setThemeColor: (color: ThemeColor) => {
    localStorage.setItem(LOCAL_KEYS.COLOR, color);
  },

  getStoreName: (): string => {
    return localStorage.getItem(LOCAL_KEYS.STORE_NAME) || "My POS Store";
  },

  setStoreName: (name: string) => {
    localStorage.setItem(LOCAL_KEYS.STORE_NAME, name);
  },

  resetData: () => {
    localStorage.clear();
    window.location.reload();
  }
};
