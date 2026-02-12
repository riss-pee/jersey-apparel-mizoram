
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface LoginProps {
  onAuthSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onAuthSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else if (data.user) {
        const u: User = {
          id: data.user.id,
          name: data.user.user_metadata.name || 'User',
          email: data.user.email || '',
          role: data.user.user_metadata.role || 'USER',
          createdAt: data.user.created_at
        };
        onAuthSuccess(u);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7]">
      {/* Left Side: Brand Visuals Asset Folder Style with Logo Background */}
      <div className="hidden md:flex md:w-7/12 bg-[#053321] relative overflow-hidden items-center justify-center p-12">
        {/* Logo Background from Assets Folder */}
        <div 
          className="absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain transform scale-90 grayscale brightness-200"
          style={{ backgroundImage: "url('/assets/logo.png')" }}
        ></div>
        
        {/* Fabric Texture Overlay */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        {/* Assets Container Visual */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white/5 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/10 shadow-3xl">
            <div className="flex flex-col items-center">
               {/* "Asset folder" visual element - using Logo as icon */}
               <div className="w-40 h-40 bg-white/10 rounded-3xl mb-8 flex items-center justify-center shadow-2xl overflow-hidden p-4">
                  <img src="/assets/logo.png" alt="JAM Logo" className="w-full h-full object-contain" />
               </div>
               
               <h1 className="text-5xl lg:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter text-[#E8E1D3]">
                  JERSEY<br />APPAREL<br />MIZORAM
               </h1>
               <div className="h-1 w-24 bg-white/20 my-8 rounded-full"></div>
               <p className="text-[#E8E1D3]/60 text-[10px] font-black tracking-[0.6em] uppercase">Authenticity • Passion • Community</p>
            </div>
          </div>
        </div>

        {/* Floating Asset Decor */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-jam-green/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-[50px]"></div>
      </div>

      {/* Right Side: Clean Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
        <div className="max-w-md w-full">
          <div className="md:hidden text-center mb-12 flex flex-col items-center">
             <img src="/assets/logo.png" alt="JAM Logo" className="w-16 h-16 mb-4" />
             <h2 className="text-2xl font-black italic uppercase text-[#053321] tracking-tighter">JAM</h2>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-black italic text-gray-900 tracking-tighter uppercase mb-3">Welcome Back</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                Enter your credentials to enter the JAM lockers and manage your collection.
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Terminal</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 focus:border-[#053321] outline-none font-bold transition-all bg-white shadow-sm focus:shadow-xl" 
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3 ml-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Secret Password</label>
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 focus:border-[#053321] outline-none font-bold transition-all bg-white shadow-sm focus:shadow-xl" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#053321] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#0a4d33] transition-all shadow-2xl active:scale-95 disabled:bg-gray-400"
                >
                  {loading ? 'Authenticating...' : 'Sign Into Account'}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  No account? {' '}
                  <button type="button" onClick={() => onNavigate('signup')} className="text-[#053321] hover:underline font-black">Register Squad</button>
                </p>
              </div>
            </form>
          </div>
          
          <div className="mt-20 flex items-center justify-between opacity-30">
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Jersey Apparel Mizoram</p>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500 italic">2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
