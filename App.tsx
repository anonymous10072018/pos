
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Product, Sale, ThemeColor } from './types';
import { StorageService } from './services/storage';
import Register from './components/Register';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  BarChart3, 
  Settings as SettingsIcon,
  Plus,
  X,
  Moon,
  Sun,
  Palette,
  Database
} from 'lucide-react';

const COLOR_OPTIONS: { name: string, value: ThemeColor, class: string }[] = [
  { name: 'Orange', value: 'orange', class: 'bg-orange-600' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-600' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-600' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-600' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-600' },
  { name: 'Slate', value: 'slate', class: 'bg-slate-700' },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>('orange');
  const [storeName, setStoreName] = useState("My POS Store");
  const [newCatName, setNewCatName] = useState('');

  // Initial Data Load
  useEffect(() => {
    setProducts(StorageService.loadProducts());
    setSales(StorageService.loadSales());
    setCategories(StorageService.loadCategories());
    setTheme(StorageService.getTheme());
    setPrimaryColor(StorageService.getThemeColor());
    setStoreName(StorageService.getStoreName());
    
    if (StorageService.getTheme() === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const colorStyles = useMemo(() => {
    const c = primaryColor;
    return {
      bg: `bg-${c}-600`,
      bgLight: `bg-${c}-50 dark:bg-${c}-900/20`,
      text: `text-${c}-600 dark:text-${c}-400`,
      border: `border-${c}-500`,
      borderLight: `border-${c}-100 dark:border-${c}-800`,
      hover: `hover:bg-${c}-700`,
      accent: `text-${c}-500`,
      fill: `fill-${c}-600`,
      ring: `focus:ring-${c}-500`,
      shadow: `shadow-${c}-100 dark:shadow-none`
    };
  }, [primaryColor]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    StorageService.setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const updateStoreName = (name: string) => {
    setStoreName(name);
    StorageService.setStoreName(name);
  };

  const updateThemeColor = (color: ThemeColor) => {
    setPrimaryColor(color);
    StorageService.setThemeColor(color);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim() || categories.includes(newCatName.trim())) return;
    const updated = [...categories, newCatName.trim()].sort();
    setCategories(updated);
    StorageService.saveCategories(updated);
    setNewCatName('');
  };

  const handleRemoveCategory = (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    setCategories(updated);
    StorageService.saveCategories(updated);
  };

  const handleSaleComplete = (newSale: Sale) => {
    const updatedSales = [...sales, newSale];
    const updatedProducts = products.map(p => {
      const soldItem = newSale.items.find(si => si.productId === p.id);
      if (soldItem && p.stock !== 0) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    });
    
    setSales(updatedSales);
    setProducts(updatedProducts);
    StorageService.saveSales(updatedSales);
    StorageService.saveProducts(updatedProducts);
    setActiveView('dashboard');
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    StorageService.saveProducts(updatedProducts);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard sales={sales} products={products} theme={theme} colorStyles={colorStyles} />;
      case 'inventory':
        return <Inventory products={products} categories={categories} onUpdateProducts={handleUpdateProducts} theme={theme} colorStyles={colorStyles} />;
      case 'reports':
        return <Reports sales={sales} theme={theme} colorStyles={colorStyles} />;
      case 'register':
        return <Register products={products} categories={categories} onSaleComplete={handleSaleComplete} theme={theme} colorStyles={colorStyles} />;
      default:
        return <Dashboard sales={sales} products={products} theme={theme} colorStyles={colorStyles} />;
    }
  };

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto shadow-2xl overflow-hidden relative border-x transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <header className={`px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${colorStyles.bg} rounded-lg flex items-center justify-center shadow-lg`}>
            <Store className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-lg font-black tracking-tight leading-none transition-colors ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            {storeName}
          </h1>
        </div>
        <button onClick={() => setShowSettings(true)} className={`p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}>
          <SettingsIcon className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {renderView()}
      </main>

      {activeView !== 'register' && (
        <button onClick={() => setActiveView('register')} className={`fixed bottom-24 right-6 w-14 h-14 ${colorStyles.bg} text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform ${colorStyles.hover}`}>
          <Plus className="w-8 h-8" />
        </button>
      )}

      <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t px-8 py-2 flex justify-between items-center z-20 pb-safe transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard className="w-6 h-6" />} label="Home" activeClass={colorStyles.text} theme={theme} />
        <NavItem active={activeView === 'inventory'} onClick={() => setActiveView('inventory')} icon={<Package className="w-6 h-6" />} label="Items" activeClass={colorStyles.text} theme={theme} />
        <NavItem active={activeView === 'reports'} onClick={() => setActiveView('reports')} icon={<BarChart3 className="w-6 h-6" />} label="Reports" activeClass={colorStyles.text} theme={theme} />
      </nav>

      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-[32px] w-full max-w-sm p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar transition-colors ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 p-2"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Business</label>
                <div className={`p-4 rounded-2xl space-y-3 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Store Name</span>
                    <input type="text" value={storeName} onChange={(e) => updateStoreName(e.target.value)} className={`w-full p-2.5 rounded-xl text-sm outline-none border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Category Customization</label>
                <div className={`p-4 rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="New category..."
                      className={`flex-1 p-2.5 rounded-xl text-sm outline-none border ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                    />
                    <button onClick={handleAddCategory} className={`${colorStyles.bg} text-white p-2.5 rounded-xl shadow-lg`}><Plus className="w-5 h-5" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <div key={cat} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-100 text-slate-600'}`}>
                        {cat}
                        <button onClick={() => handleRemoveCategory(cat)} className="text-rose-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Visuals</label>
                <div className={`p-4 rounded-2xl space-y-4 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <button onClick={toggleTheme} className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                    <div className="flex items-center gap-3">
                      {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                      <span className="font-semibold text-sm">{theme === 'light' ? 'Light' : 'Dark'} Mode</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${theme === 'dark' ? colorStyles.bg : 'bg-slate-300'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Color Theme</span>
                    <div className="grid grid-cols-6 gap-2">
                      {COLOR_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => updateThemeColor(opt.value)} className={`w-8 h-8 rounded-full ${opt.class} ${primaryColor === opt.value ? 'ring-4 ring-white dark:ring-slate-400 shadow-lg' : ''} transition-all`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-xl">
                  <Database className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Local Storage Mode</span>
                    <span className="text-[9px] text-blue-500">All data is kept on this device only.</span>
                  </div>
                </div>
                <button onClick={() => StorageService.resetData()} className="w-full py-2.5 bg-rose-600/10 text-rose-600 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/30">Wipe Data & Reset App</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeClass: string, theme: string }> = ({ active, onClick, icon, label, activeClass, theme }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-200 py-1 ${active ? activeClass : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    {label && <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>}
  </button>
);

export default App;
