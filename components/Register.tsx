
import React, { useState, useMemo } from 'react';
import { Product, Sale, SaleItem } from '../types';
import { Search, ShoppingCart, Trash2, ChevronRight, X, Package, Filter, Minus, Plus } from 'lucide-react';

interface Props {
  products: Product[];
  categories: string[];
  onSaleComplete: (sale: Sale) => void;
  theme: string;
  colorStyles: any;
}

const Register: React.FC<Props> = ({ products, categories: categoryList, onSaleComplete, theme, colorStyles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const categories = useMemo(() => ['All', ...categoryList], [categoryList]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (product.stock > 0 && existing.quantity >= product.stock) return prev;
        return prev.map(i => i.productId === product.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        category: product.category,
        quantity: 1, 
        priceAtSale: product.price 
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; 
          if (product.stock > 0 && newQty > product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const total = useMemo(() => cart.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0), [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newSale: Sale = {
      id: `TRX-${Date.now().toString().slice(-6)}`,
      items: [...cart],
      total: total,
      timestamp: Date.now()
    };
    onSaleComplete(newSale);
    setCart([]);
    setShowCart(false);
  };

  return (
    <div className="flex flex-col h-full transition-colors dark:bg-slate-900 bg-white">
      {/* Search and Categories */}
      <div className="sticky top-0 z-10 transition-colors dark:bg-slate-800 bg-white border-b dark:border-slate-700 border-slate-100 shadow-sm">
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className={`w-full pl-10 pr-4 py-2 transition-colors dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 ${colorStyles.ring} outline-none`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat 
                  ? `${colorStyles.bg} text-white shadow-lg` 
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 no-scrollbar">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            className={`flex flex-col border rounded-2xl text-left transition-all relative overflow-hidden group dark:bg-slate-800 dark:border-slate-700 bg-white border-slate-100 hover:${colorStyles.border} shadow-sm active:scale-95 transition-transform`}
          >
            <div className="h-28 w-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-8 h-8" /></div>
              )}
            </div>
            <div className="p-3">
              <h5 className="font-bold dark:text-slate-100 text-slate-800 text-xs truncate">{product.name}</h5>
              <div className="flex items-center justify-between mt-1">
                <p className={`font-black ${colorStyles.text} text-sm`}>₱{product.price.toLocaleString()}</p>
                <span className={`text-[9px] font-bold ${product.stock < 5 && product.stock > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {product.stock === 0 ? '∞' : `Qty: ${product.stock}`}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Floating Cart Button - WHITE bg with ORANGE icon as requested */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-[110px] right-6 w-16 h-16 bg-white dark:bg-slate-100 rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce transition-transform hover:scale-105 border-2 border-orange-500"
        >
          <ShoppingCart className="w-8 h-8 text-orange-600" />
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] w-6 h-6 rounded-full flex items-center justify-center font-black border-2 border-white">
            {cart.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md dark:bg-slate-800 bg-white rounded-t-[32px] p-6 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black dark:text-slate-100 text-slate-900">Items in Cart</h3>
              <button onClick={() => setShowCart(false)} className="p-2 dark:bg-slate-700 bg-slate-100 rounded-full">
                <X className="w-5 h-5 dark:text-slate-300 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between py-3 border-b dark:border-slate-700 border-slate-50">
                  <div className="flex-1">
                    <p className="font-bold dark:text-slate-100 text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500 font-medium">₱{item.priceAtSale.toLocaleString()} / unit</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-700 rounded-xl px-2 py-1">
                      <button onClick={() => updateQuantity(item.productId, -1)} className={`${colorStyles.text}`}><Minus className="w-4 h-4" /></button>
                      <span className="text-sm font-black dark:text-slate-100 min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className={`${colorStyles.text}`}><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-col items-end min-w-[70px]">
                      <span className="font-black dark:text-slate-100 text-slate-900">₱{(item.quantity * item.priceAtSale).toLocaleString()}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-rose-400 text-[10px] font-bold uppercase mt-1">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-5 dark:bg-slate-700 bg-slate-50 rounded-2xl border border-slate-100 dark:border-slate-600">
                <span className="font-bold text-slate-500 dark:text-slate-300">Total Amount</span>
                <span className="text-3xl font-black dark:text-slate-100 text-slate-900">₱{total.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                className={`w-full py-5 ${colorStyles.bg} text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3`}
              >
                Complete Sale <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
