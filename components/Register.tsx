
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
        if (product.stock > 0 && existing.quantity >= product.stock) {
          return prev;
        }
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
      id: Date.now().toString(),
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
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-3">
          <div className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${selectedCategory === 'All' ? colorStyles.bgLight : 'bg-slate-50 dark:bg-slate-700'}`}>
            <Filter className={`w-3.5 h-3.5 ${selectedCategory === 'All' ? colorStyles.text : 'text-slate-400'}`} />
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat 
                  ? `${colorStyles.bg} text-white shadow-md ${colorStyles.shadow}` 
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
            className={`flex flex-col border rounded-2xl text-left transition-all relative overflow-hidden group dark:bg-slate-800 dark:border-slate-700 bg-white border-slate-100 hover:${colorStyles.border} hover:shadow-md active:scale-95 transition-transform`}
          >
            {/* Image Section */}
            <div className="h-28 w-full bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Package className="w-8 h-8" />
                </div>
              )}
              {selectedCategory === 'All' && (
                <span className="absolute top-2 left-2 text-[8px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {product.category}
                </span>
              )}
            </div>

            <div className="p-3">
              <h5 className="font-semibold dark:text-slate-100 text-slate-800 line-clamp-1 text-xs">{product.name}</h5>
              <div className="flex items-center justify-between mt-1">
                <p className={`font-bold ${colorStyles.text} text-sm`}>₱{product.price.toLocaleString()}</p>
                <div className="flex items-center gap-0.5 text-slate-400">
                  <span className="text-[9px]">Stock:</span>
                  {product.stock === 0 ? (
                    <span className={`text-[12px] font-black ${colorStyles.text} leading-none`}>∞</span>
                  ) : (
                    <span className={`text-[9px] font-bold ${product.stock < 5 ? 'text-rose-500' : ''}`}>
                      {product.stock}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Package className="w-12 h-12 text-slate-100 dark:text-slate-800 mx-auto mb-3" />
            <p className="text-slate-400 text-sm italic">No products found</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className={`fixed bottom-[110px] right-6 w-14 h-14 ${colorStyles.bg} text-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce ${colorStyles.hover} transition-colors border-4 dark:border-slate-900 border-white`}
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-900">
            {cart.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        </button>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md dark:bg-slate-800 bg-white rounded-t-[32px] p-6 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold dark:text-slate-100 text-slate-900">Order Summary</h3>
              <button onClick={() => setShowCart(false)} className="p-2 dark:bg-slate-700 bg-slate-100 rounded-full">
                <X className="w-5 h-5 dark:text-slate-300 text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between py-3 border-b dark:border-slate-700 border-slate-50">
                  <div className="flex-1">
                    <p className="font-semibold dark:text-slate-100 text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ₱{item.priceAtSale.toLocaleString()} each
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                      <button 
                        onClick={() => updateQuantity(item.productId, -1)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-600 ${colorStyles.text} transition-colors`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold dark:text-slate-100 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, 1)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-600 ${colorStyles.text} transition-colors`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col items-end min-w-[60px]">
                      <span className="font-bold dark:text-slate-100 text-slate-900">₱{(item.quantity * item.priceAtSale).toLocaleString()}</span>
                      <button onClick={() => removeFromCart(item.productId)} className="text-rose-400 text-[10px] font-bold uppercase tracking-tighter hover:text-rose-500 transition-colors mt-0.5">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 dark:bg-slate-700 bg-slate-50 rounded-2xl">
                <span className="font-medium text-slate-500 dark:text-slate-300">Total Payable</span>
                <span className="text-2xl font-black dark:text-slate-100 text-slate-900">₱{total.toLocaleString()}</span>
              </div>
              <button
                onClick={handleCheckout}
                className={`w-full py-4 ${colorStyles.bg} text-white rounded-2xl font-bold text-lg shadow-lg ${colorStyles.shadow} active:scale-95 transition-transform flex items-center justify-center gap-2`}
              >
                Checkout Now <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
