
import { Category, Product, Branch } from '../types';

const BASE_URL = 'https://possysstemapi.runasp.net/api/POS';
const CATEGORY_URL = 'https://possysstemapi.runasp.net/api/Category';
const PRODUCT_URL = 'https://possysstemapi.runasp.net/api/Product';
const BRANCH_URL = 'https://possysstemapi.runasp.net/api/Branch';
const CHECKOUT_URL = 'https://possysstemapi.runasp.net/api/BranchCheckout';

export interface StoreResponse {
  storeName?: string;
  StoreName?: string;
  message?: string;
}

export interface CheckoutRecord {
  id: number;
  branchCode: string;
  category: string;
  itemName: string;
  pricePerItem: number;
  quantity: number;
  total: number;
  dateCheckOut: string;
}

export const ApiService = {
  /**
   * STORE API
   */
  async getStoreName(): Promise<string | null> {
    try {
      const response = await fetch(`${BASE_URL}/GetStore`);
      if (!response.ok) throw new Error(`Fetch failed with status: ${response.status}`);
      const data: StoreResponse = await response.json();
      return data.storeName || data.StoreName || null;
    } catch (error) {
      console.error('ApiService.getStoreName error:', error);
      return null;
    }
  },

  async updateStoreName(name: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/UpdateStore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ StoreName: name })
      });
      return response.ok;
    } catch (error) {
      console.error('ApiService.updateStoreName error:', error);
      return false;
    }
  },

  /**
   * CATEGORY API
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${CATEGORY_URL}/GetAll`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json();
    } catch (error) {
      console.error('ApiService.getCategories error:', error);
      return [];
    }
  },

  async createCategory(name: string): Promise<Category | null> {
    try {
      const url = `${CATEGORY_URL}/Create?Category=${encodeURIComponent(name)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'accept': '*/*' }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async updateCategory(id: number, name: string): Promise<Category | null> {
    try {
      const url = `${CATEGORY_URL}/Update/${id}?Category=${encodeURIComponent(name)}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'accept': '*/*' }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${CATEGORY_URL}/Delete/${id}`, {
        method: 'DELETE',
        headers: { 'accept': '*/*' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  /**
   * BRANCH API
   */
  async getBranches(): Promise<Branch[]> {
    try {
      const response = await fetch(`${BRANCH_URL}/GetAll`);
      if (!response.ok) throw new Error("Failed to fetch branches");
      const data = await response.json();
      return data.map((b: any) => ({
        id: b.id,
        branchCode: b.branchCode || b.BranchCode,
        dateInserted: b.dateInserted
      }));
    } catch (error) {
      console.error('ApiService.getBranches error:', error);
      return [];
    }
  },

  async createBranch(code: string): Promise<Branch | null> {
    try {
      const url = `${BRANCH_URL}/Create?BranchCode=${encodeURIComponent(code)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'accept': '*/*' }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async updateBranch(id: number, code: string): Promise<Branch | null> {
    try {
      const url = `${BRANCH_URL}/Update/${id}?BranchCode=${encodeURIComponent(code)}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'accept': '*/*' }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  async deleteBranch(id: number): Promise<boolean> {
    try {
      const url = `${BRANCH_URL}/Delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'accept': '*/*' }
      });
      return response.ok;
    } catch (error) {
      console.error('ApiService.deleteBranch error:', error);
      return false;
    }
  },

  /**
   * PRODUCT API
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${PRODUCT_URL}/GetAll`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      
      return data.map((item: any) => {
        const id = (item.id !== undefined ? item.id : item.Id).toString();
        const name = item.itemName || item.ItemName || 'Unnamed Item';
        const price = item.price !== undefined ? item.price : (item.Price || 0);
        const category = item.category || item.Category || 'Other';
        const stock = item.stock !== undefined ? item.stock : (item.Stock || 0);
        const imageSize = item.imageSizeKB !== undefined ? item.imageSizeKB : (item.ImageSizeKB || 0);

        return {
          id,
          name,
          price,
          category,
          stock,
          imageUrl: imageSize > 0 ? `${PRODUCT_URL}/GetImage/${id}/image?t=${Date.now()}` : undefined
        };
      });
    } catch (error) {
      console.error('ApiService.getProducts error:', error);
      return [];
    }
  },

  async createProduct(formData: FormData): Promise<boolean> {
    try {
      const response = await fetch(`${PRODUCT_URL}/Create`, {
        method: 'POST',
        headers: { 'accept': '*/*' },
        body: formData 
      });
      return response.ok;
    } catch (error) {
      console.error('ApiService.createProduct error:', error);
      return false;
    }
  },

  async updateProduct(id: string, formData: FormData): Promise<boolean> {
    try {
      const response = await fetch(`${PRODUCT_URL}/Update/${id}`, {
        method: 'PUT',
        headers: { 'accept': '*/*' },
        body: formData
      });
      return response.ok;
    } catch (error) {
      console.error('ApiService.updateProduct error:', error);
      return false;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const url = `${PRODUCT_URL}/Delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'accept': '*/*' }
      });
      return response.ok;
    } catch (error) {
      console.error('ApiService.deleteProduct error:', error);
      return false;
    }
  },

  /**
   * BRANCH CHECKOUT API
   */
  async checkoutItem(dto: {
    branchCode: string;
    category: string;
    itemName: string;
    pricePerItem: number;
    quantity: number;
  }): Promise<boolean> {
    try {
      // Corrected to use query parameters as requested
      const url = `${CHECKOUT_URL}/Create?BranchCode=${encodeURIComponent(dto.branchCode)}&Category=${encodeURIComponent(dto.category)}&ItemName=${encodeURIComponent(dto.itemName)}&PricePerItem=${dto.pricePerItem}&Quantity=${dto.quantity}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*'
        },
        body: '' // Body is empty as per curl example
      });
      return response.ok;
    } catch (error) {
      console.error('ApiService.checkoutItem error:', error);
      return false;
    }
  },

  async getCheckoutHistory(): Promise<CheckoutRecord[]> {
    try {
      const response = await fetch(`${CHECKOUT_URL}/GetAll`);
      if (!response.ok) throw new Error("Failed to fetch checkout history");
      return await response.json();
    } catch (error) {
      console.error('ApiService.getCheckoutHistory error:', error);
      return [];
    }
  }
};
