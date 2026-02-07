
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      onLoginSuccess(u);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFBF7]">
      {/* Left Side: Brand Background (Mimics the user-provided image) */}
      <div className="hidden md:flex md:w-7/12 bg-[#053321] relative overflow-hidden items-center justify-center p-12">
        {/* Fabric Texture Overlay */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        {/* Brand Identity Container */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center space-x-8">
             {/* Shield Logo Mimic */}
             <div className="w-48 h-56 border-[6px] border-[#E8E1D3] rounded-t-[4rem] rounded-b-[1rem] flex items-center justify-center relative">
                <div className="w-32 h-40 bg-[#E8E1D3] clip-jersey">
                   {/* Abstract Jersey Shape */}
                   <style>{`.clip-jersey { clip-path: polygon(25% 0%, 75% 0%, 100% 20%, 100% 100%, 0% 100%, 0% 20%); }`}</style>
                </div>
                <div className="absolute -top-10 bg-[#053321] p-2">
                   <div className="w-16 h-16 bg-[#E8E1D3] rounded-full"></div>
                </div>
             </div>
             
             {/* Brand Text */}
             <div className="text-left">
                <h1 className="text-5xl lg:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter text-[#E8E1D3]">
                   JERSEY<br />APPAREL<br />MIZORAM
                </h1>
                <p className="mt-4 text-[#E8E1D3]/60 text-sm font-black tracking-[0.4em] uppercase">Est. 2024</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Clean Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-12">
             <h2 className="text-2xl font-black italic uppercase text-[#053321] tracking-tighter">JAM</h2>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-black italic text-gray-900 tracking-tighter uppercase mb-3">Welcome Back</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                Login to access your personalized locker room and track pending shipments across Aizawl.
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-red-100 animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Terminal</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 focus:border-[#053321] outline-none font-bold transition-all bg-white shadow-sm focus:shadow-xl focus:shadow-[#053321]/5" 
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3 ml-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Secret Password</label>
                    <button type="button" className="text-[9px] font-black text-[#053321] uppercase tracking-widest hover:underline decoration-2">Lost Password?</button>
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 focus:border-[#053321] outline-none font-bold transition-all bg-white shadow-sm focus:shadow-xl focus:shadow-[#053321]/5" 
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
                  className="w-full bg-[#053321] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#0a4d33] transition-all shadow-2xl shadow-[#053321]/20 disabled:bg-gray-300 active:scale-95"
                >
                  {loading ? 'Authenticating...' : 'Sign Into Account'}
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  No account? {' '}
                  <button type="button" onClick={() => onNavigate('signup')} className="text-[#053321] hover:underline decoration-2 underline-offset-4 font-black">Register Squad</button>
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
