
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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Brand Visuals */}
      <div className="hidden md:flex md:w-1/2 bg-jam-green relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        <div className="relative z-10 text-center text-white space-y-6 max-w-md">
          <div className="w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-tight">
            JERSEY APPAREL MIZORAM
          </h1>
          <div className="h-1 w-20 bg-white/40 mx-auto rounded-full"></div>
          <p className="text-lg font-medium text-white/70 italic">
            "Authenticity in every thread. Mizoram's finest collection."
          </p>
        </div>
        {/* Abstract decor */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-gray-50/50">
        <div className="max-w-md w-full">
          <div className="md:hidden text-center mb-10">
             <h2 className="text-2xl font-black italic uppercase text-jam-green tracking-tighter">JERSEY APPAREL MIZORAM</h2>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white relative">
            <div className="mb-10">
              <h2 className="text-3xl font-black italic text-gray-900 tracking-tighter uppercase mb-2">Sign In</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access your tactical kit history</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-red-100 animate-pulse">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-jam-green/5" 
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-[9px] font-black text-jam-green uppercase tracking-widest hover:underline">Forgot?</button>
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-jam-green/5" 
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
                  className="w-full bg-jam-green text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 transition-all shadow-2xl shadow-green-900/20 disabled:bg-gray-400 active:scale-95"
                >
                  {loading ? 'Verifying Credentials...' : 'Sign Into Account'}
                </button>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Not a member yet? {' '}
                  <button type="button" onClick={() => onNavigate('signup')} className="text-jam-green hover:underline decoration-2 underline-offset-4 font-black">Register Now</button>
                </p>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center flex items-center justify-center space-x-4 opacity-40">
             <div className="h-px w-8 bg-gray-300"></div>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">Official Portal</p>
             <div className="h-px w-8 bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
