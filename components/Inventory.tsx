
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Plus, Edit2, Package2, AlertCircle, Image as ImageIcon, Upload, Tag, ChevronDown, X } from 'lucide-react';

interface Props {
  products: Product[];
  categories: string[];
  onUpdateProducts: (products: Product[]) => void;
  theme: string;
  colorStyles: any;
}

const Inventory: React.FC<Props> = ({ products, categories, onUpdateProducts, theme, colorStyles }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editForm.name || !editForm.category) return;
    const newProducts = products.map(p => p.id === editForm.id ? editForm : p);
    onUpdateProducts(newProducts);
    setEditingId(null);
    setEditForm(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editForm.name || !editForm.category) return;
    const newProduct = { ...editForm, id: Date.now().toString() };
    onUpdateProducts([...products, newProduct]);
    setIsAdding(false);
    setEditForm(null);
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditForm({ id: '', name: '', price: 0, category: categories[0] || 'Other', stock: 0, imageUrl: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 transition-colors dark:bg-slate-900 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-slate-100 text-slate-900">Inventory</h2>
          <p className="text-slate-500 text-sm">{products.length} Products listed</p>
        </div>
        <button 
          onClick={startAdding}
          className={`${colorStyles.bg} text-white p-2 rounded-xl shadow-lg ${colorStyles.shadow} flex items-center gap-1 text-sm font-semibold px-4`}
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="space-y-4">
        {/* Add/Edit Form Overlay */}
        {(isAdding || editingId) && editForm && (
          <form 
            onSubmit={isAdding ? handleAdd : handleSave}
            className={`bg-white dark:bg-slate-800 border-2 ${colorStyles.border} p-5 rounded-3xl animate-in slide-in-from-top-4 duration-300 shadow-xl z-50 sticky top-0 mb-8`}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-bold dark:text-slate-100 text-slate-800 flex items-center gap-2`}>
                <Package2 className={`w-4 h-4 ${colorStyles.accent}`} /> 
                {isAdding ? 'New Item' : 'Edit Item'}
              </h4>
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Image Picker */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div 
                  className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-600 overflow-hidden flex items-center justify-center cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {editForm.imageUrl ? (
                    <img src={editForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Name *</label>
                <input 
                  required
                  type="text" 
                  className={`w-full p-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm ${colorStyles.ring} outline-none`}
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Category *</label>
                <div className="relative">
                  <select
                    required
                    className={`w-full appearance-none pl-10 pr-10 py-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm ${colorStyles.ring} outline-none`}
                    value={editForm.category}
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                  >
                    {categories.length > 0 ? categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    )) : <option value="Uncategorized">Uncategorized</option>}
                  </select>
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Price (₱) *</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    className={`w-full p-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm ${colorStyles.ring} outline-none`}
                    value={editForm.price || ''}
                    onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Stock (0=∞) *</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    className={`w-full p-2.5 dark:bg-slate-700 dark:text-slate-100 bg-slate-50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm ${colorStyles.ring} outline-none`}
                    value={editForm.stock}
                    onChange={e => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className={`flex-1 ${colorStyles.bg} text-white py-3 rounded-2xl text-sm font-bold shadow-lg active:scale-95 transition-transform`}
                >
                  {isAdding ? 'Save Product' : 'Apply Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Product List */}
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className={`dark:bg-slate-800 bg-white p-3 rounded-2xl border dark:border-slate-700 border-slate-100 shadow-sm flex items-center gap-4 group hover:${colorStyles.border} transition-colors`}>
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border dark:border-slate-600 border-slate-50">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold dark:text-slate-100 text-slate-800 truncate">{product.name}</h5>
                  {product.stock > 0 && product.stock < 10 && (
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                  )}
                </div>
                <div className="flex gap-4 text-[11px] font-medium mt-1">
                  <span className={`${colorStyles.text} font-bold`}>₱{product.price.toLocaleString()}</span>
                  <span className={`${product.stock === 0 ? `${colorStyles.text} font-black` : (product.stock < 10 ? 'text-amber-600' : 'text-slate-400')}`}>
                    {product.stock === 0 ? '∞ Stock' : `${product.stock} in stock`}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => handleEdit(product)}
                className={`p-2 text-slate-400 hover:${colorStyles.text} hover:${colorStyles.bgLight} rounded-xl transition-all`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
