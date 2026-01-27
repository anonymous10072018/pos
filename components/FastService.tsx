
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Sale, SaleItem, Category, Branch } from '../types';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  X, 
  Package, 
  CreditCard, 
  DollarSign, 
  RotateCcw,
  Zap,
  CheckCircle2,
  ShoppingCart,
  ChevronLeft,
  MapPin,
  Settings
} from 'lucide-react';

interface Props {
  products: Product[];
  categories: Category[];
  onSaleComplete: (sale: Sale) => void;
  theme: string;
  colorStyles: any;
  selectedBranch: string;
  branches: Branch[];
  onSelectBranch: (code: string) => void;
  onManageBranches: () => void;
}

const CASH_PRESETS = [50, 100, 200, 500, 1000];

const FastService: React.FC<Props> = ({ 
  products, 
  categories, 
  onSaleComplete, 
  theme, 
  colorStyles, 
  selectedBranch, 
  branches, 
  onSelectBranch,
  onManageBranches
}) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  const categoryNames = useMemo(() => ['All', ...categories.map(c => c.category)], [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
  }, [products, selectedCategory]);

  const total = useMemo(() => cart.reduce((acc, i) => acc + (i.priceAtSale * i.quantity), 0), [cart]);
  const changeDue = Math.max(0, cashReceived - total);

  const addToCart = (product: Product) => {
    if (!selectedBranch) return;
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (product.stock > 0 && existing.quantity >= product.stock) return prev;
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
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
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const handleComplete = () => {
    if (cart.length === 0) return;
    const newSale: Sale = {
      id: `FS-${Date.now().toString().slice(-6)}`,
      items: [...cart],
      total: total,
      timestamp: Date.now()
    };
    
    setSuccessAnim(true);
    setTimeout(() => {
      onSaleComplete(newSale);
      setCart([]);
      setCashReceived(0);
      setShowCheckout(false);
      setSuccessAnim(false);
    }, 800);
  };

  if (!selectedBranch) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 overflow-y-auto no-scrollbar">
        <div className={`w-20 h-20 rounded-3xl ${colorStyles.bgLight} flex items-center justify-center mb-6 flex-shrink-0`}>
           <MapPin className={`w-10 h-10 ${colorStyles.text}`} />
        </div>
        <div className="text-center space-y-2 mb-8">
           <h3 className={`text-xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Select Branch to Start</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">Please identify your current operating location before taking orders.</p>
        </div>
        
        <div className="w-full max-w-[280px] space-y-3">
          {branches.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
               {branches.map(b => (
                 <button
                  key={b.id}
                  onClick={() => onSelectBranch(b.branchCode)}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 active:scale-[0.98] ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-500' : 'bg-white border-slate-100 text-slate-800 hover:border-slate-300 shadow-sm'
                  }`}
                 >
                   {b.branchCode}
                 </button>
               ))}
            </div>
          ) : (
            <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 text-center">
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">No branch codes found in cloud.</p>
            </div>
          )}
          
          <button 
            onClick={onManageBranches}
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-3 h-3" /> Manage Locations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex flex-1 overflow-hidden h-full">
        
        {/* LEFT SIDE: Product Selection */}
        <div className="flex-[1.4] flex flex-col border-r dark:border-slate-800 bg-white dark:bg-slate-900 min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-3 border-b dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 flex-shrink-0">
            {categoryNames.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedCategory === cat 
                    ? `${colorStyles.bg} text-white shadow-md` 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 no-scrollbar content-start">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="relative aspect-square flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all p-3 group overflow-hidden shadow-sm"
              >
                <div className="absolute inset-0 w-full h-full opacity-[0.1] grayscale group-hover:scale-105 transition-transform pointer-events-none">
                  {product.imageUrl && <img src={product.imageUrl} className="w-full h-full object-cover" />}
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center w-full h-full justify-between py-1">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter truncate w-full">{product.category}</span>
                  <h5 className="font-bold text-[10px] leading-tight dark:text-white text-slate-900 uppercase line-clamp-2 px-1">
                    {product.name}
                  </h5>
                  <div className={`mt-1 px-3 py-1 rounded-lg ${colorStyles.bgLight} ${colorStyles.text} font-black text-[9px]`}>
                    ₱{product.price.toLocaleString()}
                  </div>
                </div>

                {cart.find(i => i.productId === product.id) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-in zoom-in">
                    {cart.find(i => i.productId === product.id)?.quantity}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Summary / Bill (Pinned bottom) */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800/50 shadow-inner min-w-0">
          <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-800 flex-shrink-0">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 truncate">
              <ShoppingCart className={`w-3 h-3 ${colorStyles.text} flex-shrink-0`} /> Bill
            </h4>
            <button onClick={clearCart} className="text-slate-300 hover:text-rose-500 p-1 transition-colors flex-shrink-0"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {cart.map(item => (
              <div key={item.productId} className="flex flex-col gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-right-2">
                <div className="min-w-0">
                  <p className="font-bold text-[10px] dark:text-slate-200 truncate leading-tight mb-1">{item.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold">₱{item.priceAtSale} × {item.quantity}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50 pt-1.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, -1)} className={`p-1 rounded-md bg-slate-50 dark:bg-slate-700 ${colorStyles.text}`}><Minus className="w-2.5 h-2.5" /></button>
                    <span className="text-[9px] font-black dark:text-white w-3 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className={`p-1 rounded-md bg-slate-50 dark:bg-slate-700 ${colorStyles.text}`}><Plus className="w-2.5 h-2.5" /></button>
                  </div>
                  <span className={`text-[10px] font-black ${colorStyles.text}`}>₱{(item.priceAtSale * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10 opacity-40">
                <Package className="w-8 h-8 mb-2 flex-shrink-0" />
                <p className="text-[8px] font-black uppercase tracking-widest">Empty</p>
              </div>
            )}
          </div>

          {/* BOTTOM TOTAL AREA: ALWAYS PINNED */}
          <div className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-800 space-y-3 flex-shrink-0">
            <div className="flex justify-between items-end">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
               <span className={`text-xl font-black ${colorStyles.text}`}>₱{total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={cart.length === 0}
              className={`w-full py-4 ${colorStyles.bg} text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale`}
            >
              Checkout <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
          <div className={`w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            {successAnim ? (
              <div className="p-12 flex flex-col items-center justify-center gap-6">
                <div className={`w-20 h-20 rounded-full ${colorStyles.bg} flex items-center justify-center shadow-xl animate-bounce`}>
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Order Paid!</h3>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Payment</h3>
                  <button onClick={() => setShowCheckout(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full flex-shrink-0"><X className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border dark:border-slate-700">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Due</span>
                    <span className="text-xl font-black">₱{total}</span>
                  </div>
                  <div className={`flex flex-col items-center justify-center p-4 ${colorStyles.bgLight} border-2 ${colorStyles.border} rounded-2xl`}>
                    <span className={`text-[8px] font-black ${colorStyles.text} uppercase tracking-tighter`}>Change</span>
                    <span className={`text-xl font-black ${colorStyles.text}`}>₱{changeDue}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest px-1">Quick Cash Presets</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CASH_PRESETS.map(preset => (
                      <button 
                        key={preset}
                        onClick={() => setCashReceived(preset)}
                        className={`py-3 rounded-xl font-black text-[11px] border-2 transition-all ${
                          cashReceived === preset ? `${colorStyles.bg} text-white border-transparent shadow-md scale-105` : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 dark:border-slate-600'
                        }`}
                      >
                        ₱{preset}
                      </button>
                    ))}
                    <button onClick={() => setCashReceived(total)} className="py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase">Exact</button>
                    <button onClick={() => setCashReceived(0)} className="py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[9px] uppercase">Reset</button>
                  </div>
                </div>

                <button
                  onClick={handleComplete}
                  className={`w-full py-5 ${colorStyles.bg} text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all`}
                >
                  Confirm Sale <DollarSign className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FastService;
