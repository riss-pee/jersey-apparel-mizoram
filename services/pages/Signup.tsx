
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

interface SignupProps {
  onSignupSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      onSignupSuccess(newUser);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join the JAM community today.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jam-green focus:border-transparent transition-all outline-none" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jam-green focus:border-transparent transition-all outline-none" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jam-green focus:border-transparent transition-all outline-none" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-jam-green text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-all shadow-md disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account? {' '}
              <button type="button" onClick={() => onNavigate('login')} className="font-bold text-jam-green hover:underline">Log in</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
