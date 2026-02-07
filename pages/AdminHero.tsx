
import React, { useState } from 'react';
import { User, HeroSlide } from '../types';
import { storageService } from '../services/storageService';

interface AdminHeroProps {
  user: User | null;
  slides: HeroSlide[];
  onUpdate: () => void;
}

const AdminHero: React.FC<AdminHeroProps> = ({ user, slides, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    badge: '',
    title: '',
    description: '',
    buttonText: 'Shop Now',
    accentColor: '#064e3b', // Default to JAM Green hex
    displayOrder: 1
  });

  if (user?.role !== 'ADMIN') return <div className="p-20 text-center text-red-600 font-bold">Unauthorized Access</div>;

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      badge: '',
      title: '',
      description: '',
      buttonText: 'Shop Now',
      accentColor: '#064e3b',
      displayOrder: slides.length + 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData(slide);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const slideToSave = {
        ...formData,
        id: editingSlide ? editingSlide.id : `hero-${Date.now()}`
      } as HeroSlide;
      await storageService.saveHeroSlide(slideToSave);
      onUpdate();
      setShowModal(false);
    } catch (err) {
      alert("Error saving hero slide.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this hero slide?")) return;
    try {
      await storageService.deleteHeroSlide(id);
      onUpdate();
    } catch (err) {
      alert("Error deleting hero slide.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-jam-green italic uppercase tracking-tighter">Hero Carousel Management</h1>
          <p className="text-gray-500 font-medium">Customize the main store banner and messaging.</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-jam-green text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 transition shadow-xl">
          + Add New Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {slides.map(slide => (
          <div key={slide.id} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-jam-green/10 text-jam-green text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Slide #{slide.displayOrder}</span>
              <div className="flex space-x-4">
                <button onClick={() => handleOpenEdit(slide)} className="text-jam-green font-bold text-xs hover:underline">Edit</button>
                <button onClick={() => handleDelete(slide.id)} className="text-red-500 font-bold text-xs hover:underline">Delete</button>
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 whitespace-pre-line leading-tight">{slide.title}</h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2">{slide.description}</p>
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl border border-gray-100 shadow-inner" 
                style={{ background: `linear-gradient(135deg, ${slide.accentColor}, #000)` }}
              ></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accent: {slide.accentColor}</p>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem]">
            <p className="text-gray-400 font-bold italic">No custom slides found. Add one to replace the defaults.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl">
            <h2 className="text-3xl font-black italic tracking-tighter mb-8">{editingSlide ? 'Modify Carousel Slide' : 'New Carousel Slide'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Badge Text</label>
                  <input required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="e.g. NEW SEASON DROPPED" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Main Headline (Use \n for line break)</label>
                  <input required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Authentic Kits \nFor True Fans." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sub-description</label>
                  <textarea required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-medium h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Button Text</label>
                  <input required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Order</label>
                  <input type="number" required className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 font-bold" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Accent Theme Color</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="color" 
                      className="w-16 h-16 rounded-xl border-0 cursor-pointer p-0 overflow-hidden" 
                      value={formData.accentColor} 
                      onChange={e => setFormData({...formData, accentColor: e.target.value})} 
                    />
                    <div className="flex-grow">
                      <p className="text-[10px] font-black text-gray-900 mb-1">{formData.accentColor?.toUpperCase()}</p>
                      <p className="text-[9px] text-gray-400 font-medium">Click the square to choose a brand-specific color for this slide's gradient.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-400 font-black uppercase text-xs">Cancel</button>
                <button type="submit" disabled={isSaving} className="bg-jam-green text-white px-10 py-3 rounded-xl font-black uppercase text-xs shadow-xl">{isSaving ? 'Saving...' : 'Save Slide'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHero;
