
import React, { useState, useEffect } from 'react';
import { User, SiteSettings } from '../types';
import { storageService } from '../services/storageService';

interface AdminSettingsProps {
  user: User | null;
  onUpdate: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await storageService.getSiteSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  if (user?.role !== 'ADMIN') return <div className="p-20 text-center text-red-600 font-bold">Unauthorized</div>;

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    setIsUploading(true);
    try {
      const url = await storageService.uploadImage(file);
      setSettings({ ...settings, paymentQrCode: url });
      alert("Payment QR Code uploaded.");
    } catch (err) {
      alert("Failed to upload QR code.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await storageService.updateSiteSettings(settings);
      onUpdate();
      alert("Store configuration updated successfully.");
    } catch (err) {
      alert("Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) return <div className="p-20 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-jam-green italic uppercase tracking-tighter mb-2">Store Configuration</h1>
        <p className="text-gray-500 font-medium">Manage global identity, social handles, and payment terminals.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden mb-12">
        <form onSubmit={handleSave} className="p-10 space-y-12">
          {/* Identity Section */}
          <div className="space-y-8">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-jam-green border-b pb-2">1. Brand Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">About Us (Store Story)</label>
                <textarea 
                  required 
                  className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-medium h-32" 
                  value={settings.aboutUs} 
                  onChange={e => setSettings({...settings, aboutUs: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Instagram Handle</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                  <input 
                    required 
                    className="w-full border-2 border-gray-100 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold" 
                    value={settings.instagramHandle} 
                    onChange={e => setSettings({...settings, instagramHandle: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">WhatsApp Number</label>
                <input 
                  required 
                  className="w-full border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold" 
                  value={settings.whatsappNumber} 
                  onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Payment Terminal Section */}
          <div className="space-y-8 bg-gray-50 -mx-10 p-10 border-y border-gray-100">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-jam-green border-b border-gray-200 pb-2">2. Payment Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Official UPI ID</label>
                  <input 
                    className="w-full border-2 border-white rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold bg-white shadow-sm" 
                    value={settings.upiId} 
                    onChange={e => setSettings({...settings, upiId: e.target.value})} 
                    placeholder="example@okaxis"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">GPay Number (Optional)</label>
                  <input 
                    className="w-full border-2 border-white rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold bg-white shadow-sm" 
                    value={settings.gPayNumber} 
                    onChange={e => setSettings({...settings, gPayNumber: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Paytm Number (Optional)</label>
                  <input 
                    className="w-full border-2 border-white rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-jam-green/10 transition font-bold bg-white shadow-sm" 
                    value={settings.paytmNumber} 
                    onChange={e => setSettings({...settings, paytmNumber: e.target.value})} 
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <label className="block w-full text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Payment QR Code</label>
                <div className="relative group w-full aspect-square bg-white border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden flex flex-col items-center justify-center">
                   {settings.paymentQrCode ? (
                     <>
                        <img src={settings.paymentQrCode} className="w-full h-full object-contain" alt="Payment QR" />
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-black text-[10px] uppercase tracking-widest">
                           <input type="file" onChange={handleQrUpload} className="hidden" />
                           Replace QR Code
                        </label>
                     </>
                   ) : (
                     <label className="cursor-pointer flex flex-col items-center space-y-2">
                        <input type="file" onChange={handleQrUpload} className="hidden" />
                        <span className="text-4xl text-gray-300">+</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase">Upload QR</span>
                     </label>
                   )}
                </div>
                {isUploading && <p className="text-[9px] font-black text-jam-green mt-2 animate-pulse uppercase">Uploading Asset...</p>}
              </div>
            </div>
          </div>

          <div className="pt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving || isUploading}
              className="bg-jam-green text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-green-800 transition-all active:scale-95"
            >
              {isSaving ? 'Updating Registry...' : 'Save Global Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 bg-gray-950 p-8 rounded-[2rem] border border-gray-800">
         <h3 className="text-white text-lg font-black italic uppercase tracking-tighter mb-4 flex items-center">
            <svg className="w-5 h-5 mr-3 text-jam-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Checkout Terminal Preview
         </h3>
         <div className="bg-white/5 p-8 rounded-3xl border border-white/10 max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-6">
               <span className="text-white font-black italic uppercase tracking-tighter">Scan to Pay</span>
               <span className="text-jam-green font-black text-[10px] uppercase tracking-widest">Verify Store</span>
            </div>
            <div className="bg-white p-4 rounded-2xl mb-6 aspect-square flex items-center justify-center">
               {settings.paymentQrCode ? (
                 <img src={settings.paymentQrCode} className="max-w-full max-h-full" alt="Preview QR" />
               ) : (
                 <div className="text-gray-300 font-bold text-center">QR NOT SET</div>
               )}
            </div>
            <div className="space-y-4">
               {settings.upiId && (
                 <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase">UPI ID</span>
                    <span className="text-white text-xs font-bold">{settings.upiId}</span>
                 </div>
               )}
               <p className="text-[9px] text-gray-400 italic text-center">This card will appear to users during checkout.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminSettings;
