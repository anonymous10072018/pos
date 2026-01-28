
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Product, Sale, ThemeColor, Category, Branch } from './types';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';
import Register from './components/Register';
import FastService from './components/FastService';
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
  Database,
  Save,
  Loader2,
  Check,
  Search,
  Trash2,
  AlertCircle,
  Edit2,
  MapPin,
  Building2,
  ChevronRight,
  ChevronLeft,
  Settings2,
  Tags,
  AlertTriangle,
  Zap,
  ShoppingCart
} from 'lucide-react';

const COLOR_OPTIONS: { name: string, value: ThemeColor, class: string }[] = [
  { name: 'Orange', value: 'orange', class: 'bg-orange-600' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-600' },
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-600' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-600' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-600' },
  { name: 'Slate', value: 'slate', class: 'bg-slate-700' },
];

type SettingsPage = 'menu' | 'general' | 'categories' | 'branches';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsPage, setActiveSettingsPage] = useState<SettingsPage>('menu');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>('orange');
  const [storeName, setStoreName] = useState("My POS Store");
  
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedName, setLastSyncedName] = useState("");
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    setProducts(StorageService.loadProducts());
    setSales(StorageService.loadSales());
    setTheme(StorageService.getTheme());
    setPrimaryColor(StorageService.getThemeColor());
    setSelectedBranch(StorageService.getSelectedBranch());
    
    const localStoreName = StorageService.getStoreName();
    setStoreName(localStoreName);
    setLastSyncedName(localStoreName);
    
    if (StorageService.getTheme() === 'dark') {
      document.documentElement.classList.add('dark');
    }

    syncFromRemote();
  }, []);

  useEffect(() => {
    document.title = storeName;
  }, [storeName]);

  const syncFromRemote = async () => {
    const remoteName = await ApiService.getStoreName();
    if (remoteName) {
      setStoreName(remoteName);
      setLastSyncedName(remoteName);
      StorageService.setStoreName(remoteName);
    }
    const remoteCats = await ApiService.getCategories();
    if (remoteCats) setCategories(remoteCats);
    const remoteProducts = await ApiService.getProducts();
    if (remoteProducts && remoteProducts.length > 0) {
      setProducts(remoteProducts);
      StorageService.saveProducts(remoteProducts);
    }
    const remoteBranches = await ApiService.getBranches();
    if (remoteBranches) setBranches(remoteBranches);
  };

  const colorStyles = useMemo(() => {
    const c = primaryColor;
    return {
      bg: `bg-${c}-600`,
      bgLight: `bg-${c}-50 dark:bg-${c}-900/20`,
      text: `text-${c}-600 dark:text-${c}-400`,
      border: `border-${c}-500`,
      borderLight: `border-${c}-100 dark:border-${c}-800`,
      accent: `text-${c}-500`,
      ring: `focus:ring-${c}-500`,
      shadow: `shadow-${c}-200`
    };
  }, [primaryColor]);

  const handleUpdateStoreRemote = async () => {
    if (!storeName.trim() || storeName === lastSyncedName) return;
    setIsSyncing(true);
    const success = await ApiService.updateStoreName(storeName.trim());
    if (success) {
      setLastSyncedName(storeName.trim());
      StorageService.setStoreName(storeName.trim());
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
    setIsSyncing(false);
  };

  const handleSaleComplete = async (newSale: Sale) => {
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

    for (const item of newSale.items) {
      await ApiService.checkoutItem({
        branchCode: selectedBranch,
        category: item.category,
        itemName: item.name,
        pricePerItem: item.priceAtSale,
        quantity: item.quantity
      });
    }

    setActiveView('dashboard');
  };

  const handleAddCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const result = await ApiService.createCategory(trimmed);
    if (result) {
      setCategories(prev => [result, ...prev]);
      setNewCatName('');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    const trimmed = editingCatName.trim();
    if (!trimmed) return;
    const result = await ApiService.updateCategory(id, trimmed);
    if (result) {
      setCategories(prev => prev.map(c => c.id === id ? result : c));
      setEditingCatId(null);
    }
  };

  const handleDeleteCategory = (id: number) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Category?',
      message: 'This will remove the category from the database. Existing items will remain.',
      onConfirm: async () => {
        if (await ApiService.deleteCategory(id)) {
          setCategories(prev => prev.filter(c => c.id !== id));
        }
        setConfirmState(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleAddBranch = async () => {
    const trimmed = newBranchCode.trim();
    if (!trimmed) return;
    const result = await ApiService.createBranch(trimmed);
    if (result) {
      setBranches(prev => [result, ...prev]);
      setNewBranchCode('');
    }
  };

  const handleUpdateBranch = async (id: number) => {
    const trimmed = editingBranchCode.trim();
    if (!trimmed) return;
    const result = await ApiService.updateBranch(id, trimmed);
    if (result) {
      setBranches(prev => prev.map(b => b.id === id ? result : b));
      setEditingBranchId(null);
    }
  };

  const handleDeleteBranch = (id: number) => {
    setConfirmState({
      isOpen: true,
      title: 'Remove Branch Code?',
      message: 'Are you sure? This branch code will be deleted from the cloud.',
      onConfirm: async () => {
        const branchToDelete = branches.find(b => b.id === id);
        if (await ApiService.deleteBranch(id)) {
          setBranches(prev => prev.filter(b => b.id !== id));
          if (selectedBranch === branchToDelete?.branchCode) {
            setSelectedBranch("");
            StorageService.setSelectedBranch("");
          }
        }
        setConfirmState(p => ({ ...p, isOpen: false }));
      }
    });
  };

  const handleSelectBranch = (code: string) => {
    setSelectedBranch(code);
    StorageService.setSelectedBranch(code);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    StorageService.setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  // UI Local States
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editingBranchCode, setEditingBranchCode] = useState('');

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto shadow-2xl overflow-hidden relative border-x transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
      <header className={`px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center justify-between sticky top-0 z-20 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 ${colorStyles.bg} rounded-xl flex items-center justify-center shadow-lg`}>
            <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className={`text-[12px] sm:text-sm font-black tracking-tight leading-none transition-colors truncate ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              {storeName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
               {selectedBranch ? (
                 <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${colorStyles.bgLight} ${colorStyles.text} border dark:border-white/5`}>
                   <MapPin className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                   <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate">{selectedBranch}</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20">
                   <AlertCircle className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                   <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">NO BRANCH</span>
                 </div>
               )}
            </div>
          </div>
        </div>
        <button onClick={() => { setShowSettings(true); setActiveSettingsPage('menu'); }} className={`p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0`}>
          <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {activeView === 'dashboard' && <Dashboard sales={sales} products={products} theme={theme} colorStyles={colorStyles} storeName={storeName} />}
        {activeView === 'register' && (
          <Register 
            products={products} 
            categories={categories} 
            onSaleComplete={handleSaleComplete} 
            theme={theme} 
            colorStyles={colorStyles}
            selectedBranch={selectedBranch}
            branches={branches}
            onSelectBranch={handleSelectBranch}
            onManageBranches={() => { setShowSettings(true); setActiveSettingsPage('branches'); }}
          />
        )}
        {activeView === 'fast-service' && (
          <FastService 
            products={products} 
            categories={categories} 
            onSaleComplete={handleSaleComplete} 
            theme={theme} 
            colorStyles={colorStyles} 
            selectedBranch={selectedBranch}
            branches={branches}
            onSelectBranch={handleSelectBranch}
            onManageBranches={() => { setShowSettings(true); setActiveSettingsPage('branches'); }}
          />
        )}
        {activeView === 'inventory' && <Inventory products={products} categories={categories} onUpdateProducts={(p) => { setProducts(p); StorageService.saveProducts(p); }} theme={theme} colorStyles={colorStyles} />}
        {activeView === 'reports' && <Reports theme={theme} colorStyles={colorStyles} />}
      </main>

      <nav className={`border-t px-2 py-1 sm:px-6 sm:py-2 flex justify-between items-center z-20 pb-safe transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />} label="Home" activeClass={colorStyles.text} theme={theme} />
        <NavItem active={activeView === 'register'} onClick={() => setActiveView('register')} icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />} label="Cart" activeClass={colorStyles.text} theme={theme} />
        <NavItem active={activeView === 'fast-service'} onClick={() => setActiveView('fast-service')} icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />} label="Fast" activeClass={colorStyles.text} theme={theme} />
        <NavItem active={activeView === 'inventory'} onClick={() => setActiveView('inventory')} icon={<Package className="w-4 h-4 sm:w-5 sm:h-5" />} label="Items" activeClass={colorStyles.text} theme={theme} />
        <NavItem active={activeView === 'reports'} onClick={() => setActiveView('reports')} icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />} label="Stats" activeClass={colorStyles.text} theme={theme} />
      </nav>

      {/* Settings Modal - Optimized for Small Screens */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className={`rounded-[24px] sm:rounded-[32px] w-full max-w-sm flex flex-col shadow-2xl h-[85vh] overflow-hidden transition-colors ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`px-4 py-4 sm:px-6 sm:py-5 border-b flex items-center gap-2 sm:gap-3 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
              {activeSettingsPage !== 'menu' && (
                <button onClick={() => setActiveSettingsPage('menu')} className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h3 className={`text-base sm:text-lg font-black capitalize ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {activeSettingsPage === 'menu' ? 'Settings' : activeSettingsPage}
              </h3>
              <button onClick={() => setShowSettings(false)} className="ml-auto text-slate-400 p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              {activeSettingsPage === 'menu' && (
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <SettingsMenuBtn icon={<Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />} label="General Info" desc="Store branding" onClick={() => setActiveSettingsPage('general')} theme={theme} />
                  <SettingsMenuBtn icon={<Tags className="w-4 h-4 sm:w-5 sm:h-5" />} label="Categories" desc="Item group list" onClick={() => setActiveSettingsPage('categories')} theme={theme} />
                  <SettingsMenuBtn icon={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />} label="Branches" desc="Cloud sync codes" onClick={() => setActiveSettingsPage('branches')} theme={theme} />
                  <div className="pt-6">
                    <button onClick={() => { 
                      setConfirmState({
                        isOpen: true,
                        title: 'Factory Reset?',
                        message: 'Clear all local storage? Cloud data is safe.',
                        onConfirm: () => StorageService.resetData()
                      });
                    }} className="w-full py-3 sm:py-4 bg-rose-600/10 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-600/20 active:scale-95 transition-transform">
                      Reset Local Data
                    </button>
                  </div>
                </div>
              )}

              {activeSettingsPage === 'general' && (
                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">Store Name</label>
                    <div className="flex gap-2">
                      <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className={`flex-1 min-w-0 p-3 rounded-2xl text-sm font-bold outline-none border transition-colors ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-300'}`} />
                      <button onClick={handleUpdateStoreRemote} className={`flex-shrink-0 p-3 rounded-2xl ${colorStyles.bg} text-white shadow-lg active:scale-95 transition-transform`}><Save className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">Appearance</label>
                    <div className={`p-4 sm:p-5 rounded-[24px] space-y-5 transition-colors ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}>
                      <button onClick={toggleTheme} className="w-full flex items-center justify-between">
                         <span className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Dark Mode</span>
                         <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? colorStyles.bg : 'bg-slate-300'}`}>
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0 shadow-sm'}`} />
                         </div>
                      </button>
                      <div className="grid grid-cols-6 gap-2">
                        {COLOR_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => {setPrimaryColor(opt.value); StorageService.setThemeColor(opt.value);}} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${opt.class} ${primaryColor === opt.value ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-slate-400' : ''}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsPage === 'categories' && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">Add Category</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Snacks..." className={`flex-1 min-w-0 p-3 rounded-2xl text-sm font-bold outline-none border ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'}`} value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                      <button onClick={handleAddCategory} className={`flex-shrink-0 p-3 rounded-2xl ${colorStyles.bg} text-white active:scale-95 transition-transform`}><Plus className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {categories.map(c => (
                      <div key={c.id} className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                        {editingCatId === c.id ? (
                          <div className="flex-1 flex gap-2"><input autoFocus className="flex-1 min-w-0 bg-transparent border-b border-slate-400 outline-none text-sm font-bold" value={editingCatName} onChange={e => setEditingCatName(e.target.value)} /><button onClick={() => handleUpdateCategory(c.id)} className="flex-shrink-0"><Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /></button></div>
                        ) : (
                          <><span className="text-xs sm:text-sm font-bold truncate pr-3">{c.category}</span><div className="flex items-center gap-1 sm:gap-2 flex-shrink-0"><button onClick={() => { setEditingCatId(c.id); setEditingCatName(c.category); }} className="p-1.5 opacity-50"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button><button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 text-rose-400"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button></div></>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSettingsPage === 'branches' && (
                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                   <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">Branch Selection</label>
                    <select value={selectedBranch} onChange={(e) => handleSelectBranch(e.target.value)} className={`w-full p-3 sm:p-4 rounded-2xl text-sm font-bold outline-none border ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-200'}`}>
                      <option value="">No branch</option>
                      {branches.map(b => <option key={b.id} value={b.branchCode}>{b.branchCode}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">Add Code</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="BR-101" className={`flex-1 min-w-0 p-3 rounded-2xl text-sm font-bold border ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`} value={newBranchCode} onChange={e => setNewBranchCode(e.target.value)} />
                      <button onClick={handleAddBranch} className={`flex-shrink-0 p-3 rounded-2xl ${colorStyles.bg} text-white shadow-lg active:scale-95 transition-transform`}><Plus className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </div>
                    <div className="space-y-2">
                      {branches.map(b => (
                        <div key={b.id} className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                          {editingBranchId === b.id ? (
                            <div className="flex-1 flex gap-2"><input autoFocus className="flex-1 min-w-0 bg-transparent border-b border-slate-400 outline-none text-sm font-bold" value={editingBranchCode} onChange={e => setEditingBranchCode(e.target.value)} /><button onClick={() => handleUpdateBranch(b.id)} className="flex-shrink-0"><Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /></button></div>
                          ) : (
                            <><div className="flex items-center gap-2 overflow-hidden"><div className={`w-2 h-2 flex-shrink-0 rounded-full ${selectedBranch === b.branchCode ? 'bg-emerald-500' : 'bg-slate-300'}`} /><span className="text-xs sm:text-sm font-bold truncate">{b.branchCode}</span></div><div className="flex items-center gap-1 sm:gap-2 flex-shrink-0"><button onClick={() => { setEditingBranchId(b.id); setEditingBranchCode(b.branchCode); }} className="p-1.5 opacity-50"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button><button onClick={() => handleDeleteBranch(b.id)} className="p-1.5 text-rose-400"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button></div></>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsMenuBtn: React.FC<{ icon: React.ReactNode, label: string, desc: string, onClick: () => void, theme: string }> = ({ icon, label, desc, onClick, theme }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] text-left transition-all border group active:scale-[0.98] ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-100 shadow-sm text-slate-900'}`}>
    <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all flex-shrink-0 ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'} group-hover:scale-110`}>{icon}</div>
    <div className="flex-1 overflow-hidden"><h4 className="text-xs sm:text-sm font-bold truncate">{label}</h4><p className="text-[10px] text-slate-500 truncate">{desc}</p></div>
    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
  </button>
);

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeClass: string, theme: string }> = ({ active, onClick, icon, label, activeClass, theme }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-0.5 sm:gap-1 py-1 px-1 sm:px-2 transition-all min-w-[50px] sm:min-w-[60px] ${active ? activeClass : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
