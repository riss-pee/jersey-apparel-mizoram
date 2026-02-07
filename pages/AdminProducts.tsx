
import React, { useState, useMemo } from 'react';
import { User, Product, ProductStatus } from '../types';
import { storageService } from '../services/storageService';
import { generateProductDescription } from '../services/geminiService';

interface AdminProductsProps {
  user: User | null;
  products: Product[];
  onUpdate: () => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ user, products, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmingProductId, setConfirmingProductId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    team: '',
    price: 0,
    image: '',
    description: '',
    stock: 0,
    status: 'AVAILABLE',
    category: 'PREMIER_LEAGUE',
    sizes: ['S', 'M', 'L', 'XL']
  });

  const categories = ['All', 'PREMIER_LEAGUE', 'LA_LIGA', 'SERIE_A', 'INTERNATIONAL', 'OTHER'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => filterCategory === 'All' || p.category === filterCategory);
  }, [products, filterCategory]);

  if (user?.role !== 'ADMIN') return <div className="p-20 text-center text-red-600 font-bold">Unauthorized</div>;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadError(null);
    setFormData({
      name: '',
      team: '',
      price: 0,
      image: '',
      description: '',
      stock: 0,
      status: 'AVAILABLE',
      category: 'PREMIER_LEAGUE',
      sizes: ['S', 'M', 'L', 'XL']
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setUploadError(null);
    setFormData({ ...p, sizes: p.sizes || [] });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const publicUrl = await storageService.uploadImage(file);
      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (err: any) {
      console.error("Upload failed:", err);
      // Specifically catch the RLS error and provide a helpful tip
      if (err.message?.includes('row-level security')) {
        setUploadError("Supabase Policy Error: Your Storage RLS policies are blocking this upload. Please run the SQL fix provided by the assistant.");
      } else {
        setUploadError(err.message || 'Unknown upload error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIHelp = async () => {
    if (!formData.team || !formData.name) {
      alert("Please enter Team and Name first");
      return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.team || '', formData.name || '');
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSizeToggle = (size: string) => {
    const currentSizes = formData.sizes || [];
    if (currentSizes.includes(size)) {
      setFormData({ ...formData, sizes: currentSizes.filter(s => s !== size) });
    } else {
      setFormData({ ...formData, sizes: [...currentSizes, size] });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload an image for the jersey.");
      return;
    }
    setIsSaving(true);
    try {
      if (editingProduct) {
        await storageService.updateProduct({ ...editingProduct, ...formData } as Product);
      } else {
        await storageService.addProduct({ ...formData, id: `p-${Date.now()}` } as Product);
      }
      onUpdate();
      setShowModal(false);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Database Error: Could not save product data. Ensure your 'products' table allows inserts.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await storageService.deleteProduct(id);
      setConfirmingProductId(null);
      onUpdate();
    } catch (err) {
      console.error("Delete Product Error:", err);
      alert("Cannot delete product. It may be linked to existing orders.");
    }
  };

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const getStatusBadgeColor = (status: ProductStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500 text-white';
      case 'ON_SALE': return 'bg-orange-500 text-white';
      case 'OUT_OF_STOCK': return 'bg-gray-800 text-white';
      case 'DISCONTINUED': return 'bg-red-900 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-black text-jam-green italic uppercase tracking-tighter">Product Inventory</h1>
          <p className="text-gray-500 font-medium">Catalog Management & Stock Control</p>
        </div>
        <div className="flex space-x-4 w-full md:w-auto">
          <select 
            className="border-2 border-gray-100 rounded-xl px-4 py-2 bg-white text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-jam-green/10"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Leagues' : cat.replace('_', ' ')}</option>
            ))}
          </select>
          <button onClick={handleOpenAdd} className="bg-jam-green text-white px-8 py-2 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-800 transition shadow-lg flex items-center whitespace-nowrap">
            <span className="mr-2 text-lg">+</span> Add Kit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all">
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
              <img 
                src={product.image || 'https://via.placeholder.com/600x800?text=No+Image'} 
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${product.status === 'DISCONTINUED' ? 'grayscale opacity-60' : ''}`} 
                alt={product.name} 
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-md ${getStatusBadgeColor(product.status)}`}>
                  {product.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-black text-gray-900 line-clamp-1 italic">{product.name}</h3>
                <span className="font-black text-jam-green">₹{product.price}</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{product.team} • {product.category.replace('_', ' ')}</p>
              
              <div className="mb-6">
                <div className="flex flex-wrap gap-1">
                  {product.sizes && product.sizes.map(s => (
                    <span key={s} className="text-[9px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-200 font-black">{s}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mt-auto pt-4 border-t border-gray-50">
                <span>Stock: <span className={`${product.stock < 10 ? 'text-red-500' : 'text-jam-green'}`}>{product.stock}</span></span>
                
                {confirmingProductId === product.id ? (
                  <div className="flex space-x-2 items-center">
                    <button onClick={() => handleDelete(product.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg">Confirm</button>
                    <button onClick={() => setConfirmingProductId(null)} className="bg-gray-200 text-gray-600 px-3 py-1 rounded-lg">Cancel</button>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <button onClick={() => handleOpenEdit(product)} className="text-jam-green hover:underline">Edit</button>
                    <button onClick={() => setConfirmingProductId(product.id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b z-10 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter">{editingProduct ? 'Edit Kit' : 'New Catalog Entry'}</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Store Inventory Management</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Jersey Photography</label>
                
                {uploadError && (
                  <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl text-xs text-red-700 leading-relaxed">
                    <p className="font-black mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                      UPLOAD FAILED
                    </p>
                    {uploadError}
                    <div className="mt-3 p-3 bg-white/50 rounded-xl font-mono text-[10px]">
                      Tip: Use the SQL Editor in Supabase and paste the fix script to allow 'INSERT' into storage objects.
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="w-full md:w-48 aspect-[3/4] rounded-3xl border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0 group relative">
                    {formData.image ? (
                      <>
                        <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => setFormData({...formData, image: ''})} className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <svg className="mx-auto h-12 w-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[10px] font-black text-gray-300 mt-4 uppercase tracking-tighter">Waiting for file</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow w-full space-y-4">
                    <div className="flex flex-col space-y-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="hidden" 
                        id="product-image-upload" 
                      />
                      <label 
                        htmlFor="product-image-upload" 
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-center transition-all cursor-pointer shadow-sm ${
                          isUploading ? 'bg-gray-100 text-gray-400' : 'bg-jam-green text-white hover:bg-green-800'
                        }`}
                      >
                        {isUploading ? 'Sending to Supabase...' : (formData.image ? 'Replace Image' : 'Choose File from Device')}
                      </label>
                      <p className="text-[9px] text-center text-gray-400 font-bold uppercase">Max Size: 5MB • JPG, PNG, WEBP</p>
                    </div>

                    <div className="relative pt-4 border-t border-gray-50">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-[10px] font-black text-gray-300">URL</span>
                      </div>
                      <input 
                        type="text" 
                        className="w-full border-2 border-gray-50 rounded-xl pl-12 pr-4 py-3 text-xs outline-none focus:ring-4 focus:ring-jam-green/10 bg-gray-50 font-mono" 
                        placeholder="Or paste external URL..." 
                        value={formData.image} 
                        onChange={e => setFormData({...formData, image: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Model Name</label>
                  <input required className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Home Kit 24/25" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Club / National Team</label>
                  <input required className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} placeholder="e.g. Manchester United" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Price (₹)</label>
                  <input type="number" required className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none font-bold" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Units</label>
                  <input type="number" required className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none font-bold" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Lifecycle</label>
                  <select className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ProductStatus})}>
                    <option value="AVAILABLE">Active</option>
                    <option value="ON_SALE">Promo</option>
                    <option value="OUT_OF_STOCK">Sold Out</option>
                    <option value="DISCONTINUED">Archive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">League</label>
                  <select className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                    <option value="PREMIER_LEAGUE">EPL</option>
                    <option value="LA_LIGA">La Liga</option>
                    <option value="SERIE_A">Serie A</option>
                    <option value="INTERNATIONAL">Nation</option>
                    <option value="OTHER">Mizoram/Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Size Grid Availability</label>
                <div className="flex flex-wrap gap-4 p-6 border-2 border-gray-50 rounded-3xl bg-gray-50/50">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`min-w-[70px] py-4 rounded-2xl font-black text-sm transition-all ${
                        formData.sizes?.includes(size)
                        ? 'bg-jam-green text-white shadow-xl scale-110 z-10'
                        : 'bg-white text-gray-400 border-2 border-transparent hover:border-jam-green/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Storytelling & Details</label>
                  <button type="button" onClick={handleAIHelp} disabled={isGenerating} className="text-[10px] font-black uppercase tracking-widest text-jam-green bg-green-50 px-4 py-2 rounded-xl border-2 border-jam-green/20 hover:bg-green-100 transition-all flex items-center">
                    {isGenerating ? (
                      <span className="flex items-center"><div className="animate-spin mr-2 h-3 w-3 border-2 border-jam-green border-t-transparent rounded-full"></div> Thinking...</span>
                    ) : '✨ Generate Copy'}
                  </button>
                </div>
                <textarea required rows={5} className="w-full border-2 border-gray-100 rounded-3xl px-8 py-6 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-medium leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Craft a narrative for this kit..." />
              </div>

              <div className="flex justify-end space-x-6 pt-10 border-t border-gray-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition">Discard</button>
                <button 
                  type="submit" 
                  disabled={isSaving || isUploading}
                  className="bg-jam-green text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-jam-green/30 disabled:bg-gray-300 hover:bg-green-800 transition-all active:scale-95"
                >
                  {isSaving ? 'Synchronizing...' : (editingProduct ? 'Commit Changes' : 'Publish Kit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
