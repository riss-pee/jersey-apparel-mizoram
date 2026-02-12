
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface SignupProps {
  onAuthSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onAuthSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'USER' // Hardcoded to USER for security
          }
        }
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else if (data.user) {
        const newUser: User = {
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          role: 'USER',
          createdAt: data.user.created_at
        };
        onAuthSuccess(newUser);
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side: Brand Visuals with Logo Background */}
      <div className="hidden md:flex md:w-1/2 bg-jam-green relative overflow-hidden items-center justify-center p-12">
        {/* Logo Background from Assets Folder */}
        <div 
          className="absolute inset-0 opacity-5 bg-center bg-no-repeat bg-contain transform scale-125 grayscale brightness-200"
          style={{ backgroundImage: "url('/assets/logo.png')" }}
        ></div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        <div className="relative z-10 text-center text-white space-y-6 max-w-md">
          <div className="w-40 h-40 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden p-4">
             <img src="/assets/logo.png" alt="JAM Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-tight">
            JOIN THE SQUAD
          </h1>
          <div className="h-1 w-20 bg-white/40 mx-auto rounded-full"></div>
          <p className="text-lg font-medium text-white/70 italic">
            "Register to start your authentic collection today."
          </p>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-gray-50/50">
        <div className="max-w-md w-full">
          <div className="md:hidden text-center mb-10 flex flex-col items-center">
             <img src="/assets/logo.png" alt="JAM Logo" className="w-16 h-16 mb-4" />
             <h2 className="text-2xl font-black italic uppercase text-jam-green tracking-tighter">JERSEY APPAREL MIZORAM</h2>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white relative">
            <div className="mb-10">
              <h2 className="text-3xl font-black italic text-gray-900 tracking-tighter uppercase mb-2">Create Account</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enroll in the JAM Elite Program</p>
            </div>

            <form className="space-y-6" onSubmit={handleSignup}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-red-100 animate-pulse">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all bg-gray-50/50 focus:bg-white" 
                    placeholder="First Last"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all bg-gray-50/50 focus:bg-white" 
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all bg-gray-50/50 focus:bg-white" 
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-jam-green text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 transition-all shadow-2xl shadow-green-900/20 disabled:bg-gray-400 active:scale-95"
                >
                  {loading ? 'Creating Member Identity...' : 'Register Account'}
                </button>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Already a member? {' '}
                  <button type="button" onClick={() => onNavigate('login')} className="text-jam-green hover:underline decoration-2 underline-offset-4 font-black">Login to Bag</button>
                </p>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center flex items-center justify-center space-x-4 opacity-40">
             <div className="h-px w-8 bg-gray-300"></div>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-500">JAM 2024</p>
             <div className="h-px w-8 bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
