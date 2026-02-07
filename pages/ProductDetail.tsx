
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  products: Product[];
  onAddToCart: (p: Product, size: string) => void;
  onNavigate: (page: string) => void;
  onProductClick: (productId: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, products, onAddToCart, onNavigate, onProductClick }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');

  const similarProducts = useMemo(() => {
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  const formatCategoryName = (cat: string) => {
    return cat.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const handleWhatsApp = () => {
    const message = `Hello Jersey Apparel Mizoram, I'm interested in the ${product.name} (${product.team}). Is size ${selectedSize || 'available'} in stock?`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919876543210?text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex mb-10 text-[10px] font-black uppercase tracking-widest text-gray-400" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-2">
          <li><button onClick={() => onNavigate('home')} className="hover:text-jam-green">Home</button></li>
          <li className="flex items-center">
            <span className="mx-2 opacity-30">/</span>
            <span>{formatCategoryName(product.category)}</span>
          </li>
          <li className="flex items-center">
            <span className="mx-2 opacity-30">/</span>
            <span className="text-gray-900">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-24">
        {/* Sticky Image Section */}
        <div className="lg:col-span-7">
          <div className="sticky top-28 space-y-6">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-gray-100 group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            {/* Gallery Placeholder (Premium look) */}
            <div className="grid grid-cols-4 gap-4">
               <div className="aspect-square bg-gray-100 rounded-2xl border-2 border-jam-green overflow-hidden">
                 <img src={product.image} className="w-full h-full object-cover opacity-50" />
               </div>
               <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-transparent flex items-center justify-center text-gray-300 italic text-[10px]">Front</div>
               <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-transparent flex items-center justify-center text-gray-300 italic text-[10px]">Back</div>
               <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-transparent flex items-center justify-center text-gray-300 italic text-[10px]">Fabric</div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-5 flex flex-col pt-4">
          <div className="mb-10">
            <div className="flex items-center space-x-2 mb-4">
               <span className="h-0.5 w-10 bg-jam-green"></span>
               <span className="text-xs font-black text-jam-green uppercase tracking-widest">{product.team}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tighter italic">{product.name}</h1>
            
            <div className="flex items-end space-x-6 mb-8">
              <span className="text-5xl font-black text-jam-green tracking-tighter">₹{product.price}</span>
              <div className="pb-1.5">
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                  product.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                  product.status === 'ON_SALE' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {product.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          {/* Selection Area */}
          <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 mb-8">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex justify-between">
               Select Size
               <button className="text-jam-green hover:underline">Size Guide</button>
            </h3>
            <div className="flex flex-wrap gap-4 mb-10">
              {(product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[60px] h-14 flex items-center justify-center rounded-2xl border-2 font-black transition-all ${
                    selectedSize === size
                    ? 'border-jam-green bg-jam-green text-white shadow-xl scale-110 z-10'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-jam-green/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => onAddToCart(product, selectedSize)}
                disabled={product.status === 'OUT_OF_STOCK' || !selectedSize}
                className={`w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${
                  product.status === 'OUT_OF_STOCK' 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : !selectedSize ? 'bg-gray-900 text-white opacity-50 cursor-pointer' : 'bg-jam-green text-white hover:bg-green-800'
                }`}
              >
                {!selectedSize ? 'Choose Size' : 'Add to Cart'}
              </button>
              
              <button 
                onClick={handleWhatsApp}
                className="w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all flex items-center justify-center space-x-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>Inquiry on WhatsApp</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
             <div className="flex items-center"><span className="text-lg mr-2">🔒</span> Secure</div>
             <div className="flex items-center"><span className="text-lg mr-2">🚀</span> Express</div>
             <div className="flex items-center"><span className="text-lg mr-2">🇲🇿</span> Local</div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {similarProducts.length > 0 && (
        <section className="mt-12 border-t border-gray-100 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 space-y-4 md:space-y-0">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">You might also like</h2>
              <p className="text-gray-500 font-medium">Explore more from the {formatCategoryName(product.category)} collection</p>
            </div>
            <button 
              onClick={() => onNavigate('home')}
              className="group bg-gray-50 hover:bg-jam-green hover:text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center"
            >
              Shop Full Collection
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {similarProducts.map((p) => (
              <div key={p.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-50 flex flex-col">
                <div 
                  className="cursor-pointer relative aspect-[4/5] overflow-hidden bg-gray-50"
                  onClick={() => onProductClick(p.id)}
                >
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="cursor-pointer" onClick={() => onProductClick(p.id)}>
                    <div className="flex justify-between items-start mb-1">
                       <span className="text-[10px] font-black text-jam-green uppercase tracking-widest">{p.team}</span>
                       <p className="font-black text-gray-900 italic">₹{p.price}</p>
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-jam-green transition-colors line-clamp-1 mb-4">{p.name}</h4>
                  </div>
                  <button 
                    onClick={() => onProductClick(p.id)}
                    className="mt-auto w-full py-3 bg-gray-100 text-gray-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-jam-green hover:text-white transition-all"
                  >
                    View Kit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
