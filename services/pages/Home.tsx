
import React, { useState, useMemo, useEffect } from 'react';
import { Product, HeroSlide, Review } from '../types';

interface HomeProps {
  products: Product[];
  reviews: Review[];
  heroSlides: HeroSlide[];
  onAddToCart: (p: Product, size: string) => void;
  onNavigate: (page: string) => void;
  onProductClick: (productId: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, reviews, heroSlides, onAddToCart, onNavigate, onProductClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>('All Teams');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides]);

  const categories = ['All', 'PREMIER_LEAGUE', 'LA_LIGA', 'SERIE_A', 'INTERNATIONAL', 'OTHER'];

  const uniqueTeams = useMemo(() => {
    const teams = products.map(p => p.team);
    const teamList: string[] = ['All Teams', ...Array.from(new Set(teams)) as string[]];
    return teamList.sort((a, b) => {
      if (a === 'All Teams') return -1;
      if (b === 'All Teams') return 1;
      return a.localeCompare(b);
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesTeam = selectedTeam === 'All Teams' || p.team === selectedTeam;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.team.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTeam && matchesSearch;
    });
  }, [products, selectedCategory, selectedTeam, searchQuery]);

  const getProductRating = (productId: string) => {
    const productReviews = reviews.filter(r => r.productId === productId);
    if (productReviews.length === 0) return null;
    const avg = productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length;
    return { avg: avg.toFixed(1), count: productReviews.length };
  };

  const formatCategoryName = (cat: string) => {
    return cat.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const getGradient = (hex: string) => {
    if (!hex || !hex.startsWith('#')) return `linear-gradient(to right, #064e3b66, black)`;
    return `linear-gradient(to right, ${hex}66, black)`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-[600px] bg-black overflow-hidden">
        {heroSlides.length > 0 ? (
          heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{ background: getGradient(slide.accentColor) }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl text-white">
                  <span className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                    {slide.badge}
                  </span>
                  <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 whitespace-pre-line leading-none">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-300 mb-10 font-medium">{slide.description}</p>
                  <button onClick={() => onNavigate('home')} className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition shadow-2xl">
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-jam-green flex items-center justify-center">
            <h1 className="text-white text-4xl font-black italic tracking-tighter uppercase text-center px-4">JERSEY APPAREL MIZORAM</h1>
          </div>
        )}
        
        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
            ))}
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Current Catalog</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Showing {filteredProducts.length} Authenticated Pieces</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <input type="text" placeholder="Search team or model..." className="pl-10 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-sm font-bold w-full md:w-64 focus:ring-2 focus:ring-jam-green outline-none transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)} className="md:hidden bg-gray-100 p-3 rounded-2xl text-gray-600 hover:bg-gray-200 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg></button>
            <div className={`flex flex-col md:flex-row gap-4 w-full md:w-auto ${isFilterDrawerOpen ? 'flex' : 'hidden md:flex'}`}>
              <select className="bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-jam-green outline-none" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map(cat => (<option key={cat} value={cat}>{cat === 'All' ? 'All Leagues' : formatCategoryName(cat)}</option>))}
              </select>
              <select className="bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-jam-green outline-none" value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                {uniqueTeams.map(team => (<option key={team} value={team}>{team}</option>))}
              </select>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const rating = getProductRating(product.id);
              return (
                <div key={product.id} onClick={() => onProductClick(product.id)} className="group cursor-pointer">
                  <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {product.status === 'ON_SALE' && <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Promo</div>}
                    {product.status === 'OUT_OF_STOCK' && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"><span className="text-white text-xs font-black uppercase tracking-[0.2em] border-2 border-white px-4 py-2">Sold Out</span></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center">View details <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="h-0.5 w-4 bg-jam-green rounded-full"></span>
                        <p className="text-[10px] font-black text-jam-green uppercase tracking-[0.2em]">{product.team}</p>
                      </div>
                      {rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-jam-green text-[10px] font-black italic">{rating.avg}</span>
                          <svg className="w-2 h-2 text-jam-green" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-black italic text-gray-900 uppercase tracking-tighter leading-tight mb-2 group-hover:text-jam-green transition-colors">{product.name}</h3>
                    <p className="text-xl font-black text-gray-900">₹{product.price.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4 opacity-20">⚽</div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-400">No Kits Found</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <section className="bg-gray-50 py-16 border-y border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-jam-green/10 rounded-2xl flex items-center justify-center text-jam-green mx-auto"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
              <h4 className="text-xs font-black uppercase tracking-widest">100% Authentic</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-8 uppercase">Directly sourced official merchandise guaranteed.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-jam-green/10 rounded-2xl flex items-center justify-center text-jam-green mx-auto"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>
              <h4 className="text-xs font-black uppercase tracking-widest">Aizawl Delivery</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-8 uppercase">Fastest local shipping within 24 hours.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-jam-green/10 rounded-2xl flex items-center justify-center text-jam-green mx-auto"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
              <h4 className="text-xs font-black uppercase tracking-widest">Transparent Pricing</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-8 uppercase">No hidden customs or shipping fees in Mizoram.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
