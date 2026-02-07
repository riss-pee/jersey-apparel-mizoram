
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface HomeProps {
  products: Product[];
  onAddToCart: (p: Product, size: string) => void;
  onNavigate: (page: string) => void;
  onProductClick: (productId: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, onAddToCart, onNavigate, onProductClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'PREMIER_LEAGUE', 'LA_LIGA', 'SERIE_A', 'INTERNATIONAL', 'OTHER'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.team.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const formatCategoryName = (cat: string) => {
    return cat.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Premium Hero Section */}
      <div className="mb-16 relative overflow-hidden rounded-[2.5rem] bg-gray-950 text-white p-8 md:p-20 min-h-[500px] flex flex-col justify-center shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-jam-green/40 to-black/80 z-0"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-jam-green opacity-20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-widest uppercase">2024/25 Season Dropped</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tighter">
            Authentic Kits <br/><span className="text-green-400">For True Fans.</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-300 leading-relaxed max-w-lg">
            Experience the finest moisture-wicking technology. From local MSL favorites to Global Giants.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => document.getElementById('jerseys-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-jam-green font-black py-4 px-10 rounded-2xl hover:bg-green-50 transition-all shadow-xl text-lg hover:scale-[1.02] active:scale-95"
            >
              Shop Collection
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-10 rounded-2xl hover:bg-white/20 transition-all"
            >
              Join the Community
            </button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {[
          { title: "Premium Quality", desc: "1:1 Authentic Fabrics", icon: "✨" },
          { title: "Fast Delivery", desc: "Across Mizoram", icon: "📦" },
          { title: "Local Pride", desc: "Aizawl Based Store", icon: "🇲🇿" },
          { title: "Safe Payment", desc: "COD & UPI Supported", icon: "🛡️" }
        ].map((badge, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <span className="text-3xl mb-3">{badge.icon}</span>
            <h4 className="font-bold text-gray-900 text-sm">{badge.title}</h4>
            <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div id="jerseys-grid" className="mb-12 space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-end space-y-6 md:space-y-0">
          <div className="max-w-md">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">The Catalog</h2>
            <p className="text-gray-500 font-medium">Explore over {products.length}+ premium jerseys ready for the pitch.</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-jam-green transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-[1.25rem] leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-jam-green/10 focus:border-jam-green transition-all shadow-sm font-medium"
              placeholder="Search jerseys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 text-sm font-bold rounded-2xl transition-all border-2 whitespace-nowrap ${
                selectedCategory === cat 
                ? 'bg-jam-green text-white border-jam-green shadow-xl scale-105' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-jam-green/30'
              }`}
            >
              {cat === 'All' ? 'View All' : formatCategoryName(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-6">🔍</div>
          <p className="text-gray-500 text-xl font-bold">No matches found.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
            className="mt-6 bg-jam-green text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-green-800 transition"
          >
            Show Everything
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col relative">
              <div 
                className="cursor-pointer relative aspect-[3/4] overflow-hidden bg-gray-50"
                onClick={() => onProductClick(product.id)}
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                {product.status === 'ON_SALE' && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter z-10 shadow-lg">Special Offer</div>
                )}
                {product.status === 'OUT_OF_STOCK' && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl">Sold Out</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-jam-green uppercase tracking-widest">{product.team}</span>
                  <p className="text-xl font-black text-gray-900 italic">₹{product.price}</p>
                </div>
                <h3 
                  className="text-lg font-bold text-gray-900 group-hover:text-jam-green transition-colors line-clamp-1 mb-4 cursor-pointer"
                  onClick={() => onProductClick(product.id)}
                >
                  {product.name}
                </h3>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => onProductClick(product.id)}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                      product.status === 'OUT_OF_STOCK' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-900 text-white hover:bg-jam-green shadow-lg hover:shadow-jam-green/20'
                    }`}
                  >
                    View Product
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
