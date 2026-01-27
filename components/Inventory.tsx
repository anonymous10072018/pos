
import React, { useState, useRef } from 'react';
import { Product, Category } from '../types';
import { ApiService } from '../services/api';
import { Plus, Edit2, Package2, ImageIcon, X, Loader2, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  products: Product[];
  categories: Category[];
  onUpdateProducts: (products: Product[]) => void;
  theme: string;
  colorStyles: any;
}

const Inventory: React.FC<Props> = ({ products, categories, onUpdateProducts, theme, colorStyles }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showConfirm, setShowConfirm] = useState<{ isOpen: boolean, targetId: string | null }>({ isOpen: false, targetId: null });

  const refreshProducts = async () => {
    const latest = await ApiService.getProducts();
    onUpdateProducts(latest);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
    setSelectedFile(null);
  };

  const prepareFormData = (p: Product) => {
    const formData = new FormData();
    formData.append('Category', p.category);
    formData.append('ItemName', p.name);
    formData.append('Price', p.price.toString());
    formData.append('Stock', p.stock.toString());
    if (selectedFile) {
      formData.append('Image', selectedFile);
    }
    return formData;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editingId) return;
    setIsSubmitting(true);
    
    const success = await ApiService.updateProduct(editingId, prepareFormData(editForm));
    if (success) {
      await refreshProducts();
      setEditingId(null);
      setEditForm(null);
    } else {
      alert("Failed to update product.");
    }
    setIsSubmitting(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setIsSubmitting(true);

    const success = await ApiService.createProduct(prepareFormData(editForm));
    if (success) {
      await refreshProducts();
      setIsAdding(false);
      setEditForm(null);
    } else {
      alert("Failed to create product.");
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    const id = showConfirm.targetId;
    if (!id) return;
    
    setIsSubmitting(true);
    setShowConfirm({ isOpen: false, targetId: null });
    
    const success = await ApiService.deleteProduct(id);
    if (success) {
      await refreshProducts();
    } else {
      alert("Failed to delete product.");
    }
    setIsSubmitting(false);
  };

  const startAdding = () => {
    setIsAdding(true);
    setSelectedFile(null);
    setEditForm({ 
      id: '', 
      name: '', 
      price: 0, 
      category: categories[0]?.category || 'Other', 
      stock: 0, 
      imageUrl: '' 
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
      <div className="p-6 transition-colors dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold dark:text-slate-100 text-slate-900">Inventory</h2>
            <p className="text-slate-500 text-sm">{products.length} Items Listed</p>
          </div>
          <button 
            onClick={startAdding}
            className={`${colorStyles.bg} text-white p-2 rounded-xl shadow-lg flex items-center gap-1 text-sm font-semibold px-4 active:scale-95 transition-transform flex-shrink-0`}
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="space-y-4">
          {showConfirm.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/70 backdrop-blur-md">
              <div className={`rounded-[28px] w-full max-w-xs p-6 shadow-2xl border transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Delete Product?</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">This will permanently remove this item from your cloud inventory.</p>
                  </div>
                  <div className="flex flex-col w-full gap-2 mt-2">
                    <button 
                      onClick={confirmDelete}
                      className="w-full py-3.5 bg-rose-500 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      Yes, Delete
                    </button>
                    <button 
                      onClick={() => setShowConfirm({ isOpen: false, targetId: null })}
                      className={`w-full py-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-transform ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(isAdding || editingId) && editForm && (
            <form 
              onSubmit={isAdding ? handleAdd : handleSave}
              className={`bg-white dark:bg-slate-800 border-2 ${colorStyles.border} p-5 rounded-3xl shadow-xl z-50 sticky top-0 mb-8`}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className={`font-bold dark:text-slate-100 text-slate-800 flex items-center gap-2`}>
                  <Package2 className={`w-4 h-4 ${colorStyles.accent}`} /> 
                  {isAdding ? 'New Item' : 'Edit Item'}
                </h4>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-600 overflow-hidden flex items-center justify-center cursor-pointer relative flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {editForm.imageUrl ? (
                      <img src={editForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Plus className="text-white w-6 h-6" />
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tap to upload photo</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Item Name</label>
                  <input required type="text" className={`w-full p-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border rounded-xl text-sm outline-none transition-colors ${theme === 'dark' ? 'border-slate-600 focus:border-slate-400' : 'border-slate-200 focus:border-slate-300'}`} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                  <select required className={`w-full p-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border rounded-xl text-sm outline-none transition-colors ${theme === 'dark' ? 'border-slate-600 focus:border-slate-400' : 'border-slate-200 focus:border-slate-300'}`} value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    {categories.map(cat => <option key={cat.id} value={cat.category}>{cat.category}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Price (₱)</label>
                    <input required type="number" step="0.01" className={`w-full p-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border rounded-xl text-sm outline-none transition-colors ${theme === 'dark' ? 'border-slate-600 focus:border-slate-400' : 'border-slate-200 focus:border-slate-300'}`} value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Stock Qty</label>
                    <input required type="number" className={`w-full p-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border rounded-xl text-sm outline-none transition-colors ${theme === 'dark' ? 'border-slate-600 focus:border-slate-400' : 'border-slate-200 focus:border-slate-300'}`} value={editForm.stock} onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})} />
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className={`w-full ${colorStyles.bg} text-white py-3 rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all flex-shrink-0`}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAdding ? 'Create Cloud Item' : 'Update Cloud Item')}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3 pb-10">
            {products.map(product => (
              <div key={product.id} className={`dark:bg-slate-800 bg-white p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'border-slate-700' : 'border-slate-100 shadow-sm'} flex items-center gap-4 group hover:${colorStyles.border} active:scale-[0.98]`}>
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className={`font-bold truncate text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{product.name}</h5>
                  <div className="flex gap-3 text-[10px] font-bold mt-1">
                    <span className={`${colorStyles.text} uppercase`}>{product.category}</span>
                    <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>₱{product.price.toLocaleString()}</span>
                    <span className={`${product.stock < 10 ? 'text-rose-500' : 'text-slate-400'}`}>{product.stock} Units</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(product)} className={`p-2 text-slate-400 hover:${colorStyles.text} transition-colors`}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setShowConfirm({ isOpen: true, targetId: product.id })} className={`p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all active:scale-90`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-20">
                <Package2 className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 italic text-sm">No products found in the cloud.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
