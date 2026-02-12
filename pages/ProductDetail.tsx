
import React, { useState, useMemo, useEffect } from 'react';
import { Product, SiteSettings, Review } from '../types';
import { storageService } from '../services/storageService';

interface ProductDetailProps {
  product: Product;
  products: Product[];
  siteSettings: SiteSettings | null;
  onAddToCart: (p: Product, size: string, qty: number) => void;
  onNavigate: (page: string) => void;
  onProductClick: (productId: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, products, siteSettings, onAddToCart, onNavigate, onProductClick }) => {
  const [mainImage, setMainImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Sync state when product changes
  useEffect(() => {
    setMainImage(product.image);
    setSelectedSize('');
    setQuantity(1);
    setIsAdded(false);
    window.scrollTo(0, 0);
    
    // Fetch reviews
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const data = await storageService.getReviewsByProduct(product.id);
        setReviews(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const formatCategoryName = (cat: string) => {
    return cat.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const handleWhatsApp = () => {
    const waNumber = siteSettings?.whatsappNumber || '919876543210';
    const message = `Hello Jersey Apparel Mizoram, I'm interested in the ${product.name} (${product.team}). Is size ${selectedSize || 'available'} in stock?`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waNumber}?text=${encoded}`, '_blank');
  };

  const incrementQty = () => setQuantity(q => q + 1);
  const decrementQty = () => setQuantity(q => Math.max(1, q - 1));

  const handleAddToCart = () => {
    if (!selectedSize || isAdded) return;
    onAddToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getVersionBadge = (v: string) => {
    switch(v) {
      case 'PLAYER': return { text: 'PLAYER VERSION', bg: 'bg-black text-white' };
      case 'MASTER': return { text: 'MASTER VERSION', bg: 'bg-jam-green text-white' };
      case 'FAN': return { text: 'FAN VERSION', bg: 'bg-gray-100 text-gray-900' };
      default: return { text: 'JERSEY', bg: 'bg-gray-100 text-gray-900' };
    }
  };

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const badge = getVersionBadge(product.version);

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <svg 
            key={star} 
            className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-jam-green' : 'text-gray-200'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
    );
  };

  // Determine available sizes from product config
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['FREE SIZE'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex mb-10 text-[10px] font-black uppercase tracking-widest text-gray-400" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-2">
          <li><button onClick={() => onNavigate('home')} className="hover:text-jam-green transition-colors">Home</button></li>
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
        <div className="lg:col-span-7">
          <div className="sticky top-28 space-y-6">
            <div className={`aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-gray-100 group relative ${isOutOfStock ? 'grayscale opacity-70' : ''}`}>
              <img 
                src={mainImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                   <div className="bg-black text-white px-10 py-4 rounded-full border-4 border-white/10 shadow-2xl transform -rotate-6">
                      <span className="text-xl font-black uppercase tracking-widest italic">Kit Sold Out</span>
                   </div>
                </div>
              )}
            </div>
            <div className={`grid grid-cols-4 sm:grid-cols-6 gap-4 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}>
               {gallery.map((img, idx) => (
                 <button 
                  key={idx}
                  onClick={() => setMainImage(img)}
                  disabled={isOutOfStock}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${mainImage === img ? 'border-jam-green shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                   <img src={img} className="w-full h-full object-cover" alt={`Gallery view ${idx}`} />
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col pt-4">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-2 mr-2">
                    <span className={`h-1 w-8 rounded-full ${isOutOfStock ? 'bg-gray-400' : 'bg-jam-green'}`}></span>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isOutOfStock ? 'text-gray-400' : 'text-jam-green'}`}>{product.team}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase ${badge.bg}`}>
                    {badge.text}
                  </span>
               </div>
               {reviews.length > 0 && (
                 <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    {renderStars(Number(averageRating))}
                    <span className="text-[10px] font-black italic">{averageRating}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">({reviews.length} Reviews)</span>
                 </div>
               )}
            </div>
            <h1 className={`text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tighter italic uppercase ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>{product.name}</h1>
            
            <div className="flex items-end space-x-6 mb-8">
              <span className={`text-5xl font-black tracking-tighter ${isOutOfStock ? 'text-gray-300 line-through' : 'text-jam-green'}`}>₹{product.price}</span>
            </div>

            <p className={`text-lg leading-relaxed font-medium mb-6 ${isOutOfStock ? 'text-gray-400' : 'text-gray-500'}`}>
              {product.description}
            </p>
          </div>

          <div className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl mb-8 ${isOutOfStock ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <div className="mb-10">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6 flex justify-between items-center">
                 Select Available Size
                 <button className="text-jam-green hover:underline decoration-2 underline-offset-4">Size Guide</button>
              </h3>
              <div className="flex flex-wrap gap-4">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setIsAdded(false); }}
                    className={`min-w-[65px] h-14 px-4 flex items-center justify-center rounded-2xl border-2 font-black transition-all duration-300 ${
                      selectedSize === size
                      ? 'border-jam-green bg-jam-green text-white shadow-xl scale-110 z-10'
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-jam-green/30 hover:bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Quantity</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center bg-gray-950 p-2 rounded-2xl border border-gray-800 shadow-inner">
                  <button onClick={decrementQty} className="w-12 h-12 flex items-center justify-center bg-gray-800 text-white rounded-xl hover:bg-gray-700 active:scale-90 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4"/></svg>
                  </button>
                  <span className="w-16 text-center text-xl font-black text-white tabular-nums">{quantity}</span>
                  <button onClick={incrementQty} className="w-12 h-12 flex items-center justify-center bg-jam-green text-white rounded-xl hover:bg-green-700 active:scale-90 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedSize || isAdded}
                className={`w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center justify-center space-x-3 transform-gpu duration-300 ${
                  isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                  isAdded ? 'bg-green-600 text-white scale-[1.02]' : 
                  !selectedSize ? 'bg-gray-900 text-white opacity-40' : 'bg-jam-green text-white hover:bg-green-800'
                }`}
              >
                {isAdded ? (
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-2 animate-[bounce_0.5s_ease-in-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    <span>Added to Bag!</span>
                  </div>
                ) : (
                  <span>{isOutOfStock ? 'Sold Out' : !selectedSize ? 'Select Size First' : `Add to Bag — ₹${(product.price * quantity).toLocaleString()}`}</span>
                )}
              </button>
              <button onClick={handleWhatsApp} className="w-full py-5 rounded-2xl text-lg font-black uppercase bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all flex items-center justify-center space-x-3 active:scale-95">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>WhatsApp Inquiry</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24 mb-24 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
           <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Reviews</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Direct feedback from the community</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black italic text-jam-green leading-none">{averageRating}</span>
                <div className="flex items-center justify-end mt-1">
                   {renderStars(Number(averageRating))}
                </div>
              </div>
           </div>

           {loadingReviews ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-jam-green/20 border-t-jam-green rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Reviews...</p>
             </div>
           ) : reviews.length === 0 ? (
             <div className="py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic uppercase tracking-tighter">No reviews available yet.</p>
                <p className="text-[9px] text-gray-400 font-black uppercase mt-2">Be the first to share your thoughts.</p>
             </div>
           ) : (
             <div className="space-y-10">
               {reviews.map(review => (
                 <div key={review.id} className="bg-white border-b border-gray-100 pb-10 last:border-0">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-jam-green rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">
                             {review.userName.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-black italic uppercase text-gray-900 leading-none">{review.userName}</p>
                             <div className="mt-1">{renderStars(review.rating)}</div>
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                         {new Date(review.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed pl-14 italic">
                      "{review.comment}"
                    </p>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="bg-gray-950 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6">Product Care</h3>
                <div className="space-y-6">
                   {[
                     { step: '01', title: 'Cold Wash', desc: 'Preserve elasticity.' },
                     { step: '02', title: 'Inside Out', desc: 'Protect sponsor prints.' }
                   ].map((care, i) => (
                     <div key={i} className="flex items-start space-x-4">
                        <span className="text-jam-green font-black text-xl">{care.step}</span>
                        <div>
                           <p className="text-xs font-black uppercase tracking-widest mb-1">{care.title}</p>
                           <p className="text-[10px] text-gray-400 leading-relaxed">{care.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
