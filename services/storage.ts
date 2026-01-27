
import { Product, Sale, ThemeColor } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'swiftpos_products',
  SALES: 'swiftpos_sales',
  THEME: 'swiftpos_theme',
  COLOR: 'swiftpos_color',
  STORE_NAME: 'swiftpos_store_name',
  CATEGORIES: 'swiftpos_categories'
};

const INITIAL_CATEGORIES = [
  "Beverage",
  "Snacks",
  "Food",
  "Electronics",
  "Clothing",
  "Groceries",
  "Health & Beauty",
  "Household"
];

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
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getSales: (): Sale[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },

  saveSale: (sale: Sale) => {
    const sales = StorageService.getSales();
    sales.push(sale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  getTheme: (): 'light' | 'dark' => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getThemeColor: (): ThemeColor => {
    return (localStorage.getItem(STORAGE_KEYS.COLOR) as ThemeColor) || 'orange';
  },

  setThemeColor: (color: ThemeColor) => {
    localStorage.setItem(STORAGE_KEYS.COLOR, color);
  },

  getStoreName: (): string => {
    return localStorage.getItem(STORAGE_KEYS.STORE_NAME) || "Rabal's POS";
  },

  setStoreName: (name: string) => {
    localStorage.setItem(STORAGE_KEYS.STORE_NAME, name);
  },

  getCategories: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  },

  saveCategories: (categories: string[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  resetData: () => {
    localStorage.clear();
    return true;
  }
};
