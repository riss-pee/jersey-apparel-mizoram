
import React, { useState, useMemo } from 'react';
import { User, Product, ProductStatus, JerseyVersion, Review } from '../types';
import { storageService } from '../services/storageService';
import { generateProductDescription } from '../services/geminiService';

interface AdminProductsProps {
  user: User | null;
  products: Product[];
  reviews: Review[];
  onUpdate: () => void;
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const VERSIONS: JerseyVersion[] = ['PLAYER', 'MASTER', 'FAN'];

const AdminProducts: React.FC<AdminProductsProps> = ({ user, products, reviews, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    team: '',
    price: 0,
    image: '',
    images: [],
    description: '',
    stock: 0,
    status: 'AVAILABLE',
    version: 'FAN',
    category: 'PREMIER_LEAGUE',
    sizes: ['S', 'M', 'L', 'XL']
  });

  const categories = ['All', 'PREMIER_LEAGUE', 'LA_LIGA', 'SERIE_A', 'INTERNATIONAL', 'OTHER'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => filterCategory === 'All' || p.category === filterCategory);
  }, [products, filterCategory]);

  const getProductRating = (productId: string) => {
    const productReviews = reviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) return null;
    const avg = productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length;
    return { avg: avg.toFixed(1), count: productReviews.length };
  };

  if (user?.role !== 'ADMIN') return <div className="p-20 text-center text-red-600 font-bold">Unauthorized</div>;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadError(null);
    setFormData({
      name: '',
      team: '',
      price: 0,
      image: '',
      images: [],
      description: '',
      stock: 0,
      status: 'AVAILABLE',
      version: 'FAN',
      category: 'PREMIER_LEAGUE',
      sizes: ['S', 'M', 'L', 'XL']
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setUploadError(null);
    setFormData({ ...p, sizes: p.sizes || [], images: p.images || (p.image ? [p.image] : []), version: p.version || 'FAN' });
    setShowModal(true);
  };

  const toggleSize = (size: string) => {
    setFormData(prev => {
      const currentSizes = prev.sizes || [];
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter(s => s !== size)
        : [...currentSizes, size];
      const sortedSizes = [...newSizes].sort((a, b) => ALL_SIZES.indexOf(a) - ALL_SIZES.indexOf(b));
      return { ...prev, sizes: sortedSizes };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploadPromises = (Array.from(files) as File[]).map(file => storageService.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => {
        const newImages = [...(prev.images || []), ...urls];
        return { 
          ...prev, 
          images: newImages,
          image: prev.image || newImages[0]
        };
      });
    } catch (err: any) {
      console.error("Upload failed:", err);
      setUploadError(err.message || 'Unknown upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = (prev.images || []).filter((_, i) => i !== index);
      let newMainImage = prev.image;
      if (prev.image === prev.images?.[index]) {
        newMainImage = newImages.length > 0 ? newImages[0] : '';
      }
      return { ...prev, images: newImages, image: newMainImage };
    });
  };

  const setAsMainImage = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image && (!formData.images || formData.images.length === 0)) {
      alert("Please upload at least one image for the jersey.");
      return;
    }
    if (!formData.sizes || formData.sizes.length === 0) {
      alert("Please select at least one available size.");
      return;
    }
    setIsSaving(true);
    try {
      const finalData = { 
        ...formData, 
        image: formData.image || (formData.images && formData.images.length > 0 ? formData.images[0] : '') 
      } as Product;

      if (editingProduct) {
        await storageService.updateProduct({ ...editingProduct, ...finalData });
      } else {
        await storageService.addProduct({ ...finalData, id: `p-${Date.now()}` });
      }
      onUpdate();
      setShowModal(false);
    } catch (err) {
      console.error("Save Error:", err);
      alert("Database Error: Could not save product data.");
    } finally {
      setIsSaving(false);
    }
  };

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
        {filteredProducts.map(product => {
          const rating = getProductRating(product.id);
          return (
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
                  <span className="bg-black text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                    {product.version}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-black text-gray-900 line-clamp-1 italic">{product.name}</h3>
                  <span className="font-black text-jam-green">₹{product.price}</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{product.team} • {product.category.replace('_', ' ')}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                   {product.sizes?.map(s => (
                     <span key={s} className="text-[8px] font-black bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase">{s}</span>
                   ))}
                </div>

                <div className="flex items-center space-x-2 mb-4 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
                   {rating ? (
                     <>
                        <div className="flex items-center text-jam-green">
                           <span className="text-[11px] font-black italic mr-1">{rating.avg}</span>
                           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">({rating.count} Reports)</span>
                     </>
                   ) : (
                     <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">No Feedback</span>
                   )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mt-auto pt-4 border-t border-gray-50">
                  <span>Stock: <span className={`${product.stock < 10 ? 'text-red-500' : 'text-jam-green'}`}>{product.stock}</span></span>
                  <div className="flex space-x-4">
                    <button onClick={() => handleOpenEdit(product)} className="text-jam-green hover:underline">Edit</button>
                    <button onClick={async () => { if(confirm("Delete this product?")) { await storageService.deleteProduct(product.id); onUpdate(); }}} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b z-10 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter">{editingProduct ? 'Edit Kit' : 'New Catalog Entry'}</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Store Inventory Management</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-gray-100 hover:bg-gray-200 p-3 rounded-2xl transition-all">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Jersey Photography Gallery</label>
                <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
                    {(formData.images || []).map((url, idx) => (
                      <div key={idx} className={`relative aspect-[3/4] rounded-xl overflow-hidden group border-4 ${formData.image === url ? 'border-jam-green' : 'border-transparent shadow-sm'}`}>
                        <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                           <button type="button" onClick={() => setAsMainImage(url)} className="bg-white text-jam-green text-[8px] font-black uppercase px-2 py-1 rounded">Set Main</button>
                           <button type="button" onClick={() => removeImage(idx)} className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded">Remove</button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-jam-green transition-all bg-gray-100/50">
                       <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                       <span className="text-2xl text-gray-400">+</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Model Name</label>
                    <input required className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Home Kit 24/25" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Club / National Team</label>
                    <input required className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} placeholder="e.g. Manchester United" />
                  </div>
                  
                  {/* Jersey Version Selection */}
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Jersey Version</label>
                    <div className="flex gap-4">
                       {VERSIONS.map(v => (
                         <button 
                          key={v}
                          type="button"
                          onClick={() => setFormData({...formData, version: v})}
                          className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] tracking-widest transition-all uppercase ${
                            formData.version === v ? 'border-jam-green bg-jam-green text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'
                          }`}
                         >
                           {v}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
                
                <div>
                   <div className="flex justify-between items-center mb-3">
                     <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                     <button type="button" onClick={handleAIHelp} disabled={isGenerating} className="text-[10px] font-black text-jam-green uppercase tracking-widest flex items-center hover:underline disabled:opacity-50">
                        {isGenerating ? 'Drafting...' : 'Spark AI Copy'}
                     </button>
                   </div>
                   <textarea rows={8} required className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-medium text-sm leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Tactical description of the kit..." />
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

              <div className="flex justify-end space-x-6 pt-10 border-t border-gray-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-600 transition">Discard</button>
                <button 
                  type="submit" 
                  disabled={isSaving || isUploading}
                  className="bg-jam-green text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-green-800 transition-all active:scale-95"
                >
                  {isSaving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add to Catalog')}
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
