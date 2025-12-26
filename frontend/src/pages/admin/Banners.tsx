import React, { useState } from 'react';
import Button from '@components/ui/Button';
import Modal from '@components/ui/Modal';
import { Input, Textarea } from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import { useToast } from '@contexts/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  buttonText: string;
  badge: string;
  isActive: boolean;
}

interface PopupConfig {
  isActive: boolean;
  imageUrl: string;
  link: string;
  frequency: 'always' | 'once_session';
}

const BannerManagement: React.FC = () => {
  const { showError, showSuccess } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'hero' | 'popup'>('hero');

  const [banners, setBanners] = useState<Banner[]>([
    {
      id: '1',
      title: 'NEXT LEVEL GAMING PERFORMANCE',
      subtitle: 'Trải nghiệm sức mạnh đỉnh cao với dòng RTX 40 Series mới nhất. Ưu đãi đặt trước tặng ngay bộ quà 5 triệu.',
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=1600',
      link: '/catalog',
      buttonText: 'Khám phá ngay',
      badge: 'Flagship Series',
      isActive: true
    },
    {
      id: '2',
      title: 'SUMMER VIBES COLLECTION',
      subtitle: 'Phụ kiện sắc màu cho mùa hè năng động. Giảm giá 20% cho tất cả tai nghe và loa bluetooth.',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1600',
      link: '/catalog?category=Phụ kiện',
      buttonText: 'Mua ngay',
      badge: 'Summer Sale',
      isActive: false
    }
  ]);

  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800',
    link: '/catalog?filter=flash-sale',
    frequency: 'once_session'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({});

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
      link: '/catalog',
      buttonText: 'Xem chi tiết',
      badge: 'New Arrival',
      isActive: false
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.imageUrl) {
      showError("Vui lòng điền tiêu đề và link ảnh");
      return;
    }
    let currentList = [...banners];
    if (formData.isActive) {
        currentList = currentList.map(b => ({ ...b, isActive: false }));
    }
    if (editingBanner) {
      setBanners(currentList.map(b => b.id === editingBanner.id ? { ...(formData as Banner), id: editingBanner.id } as Banner : b));
    } else {
      const newBanner = { ...(formData as Banner), id: Math.random().toString(36).substr(2, 5) } as Banner;
      setBanners([...currentList, newBanner]);
    }
    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    const target = banners.find(b => b.id === id);
    if (!target) return;
    if (!target.isActive) {
        setBanners(banners.map(b => ({ ...b, isActive: b.id === id })));
    } else {
        setBanners(banners.map(b => b.id === id ? { ...b, isActive: false } : b));
    }
  };

  const handleSavePopup = () => {
    showSuccess(t('admin.banners.popupSaved'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('admin.banners.title')}</h1>
          <p className="text-gray-400 mt-1">{t('admin.banners.subtitle')}</p>
        </div>
        {activeTab === 'hero' && (
            <Button onClick={handleAdd} icon="add_photo_alternate" variant="primary">
            {t('admin.banners.addBannerSlider')}
            </Button>
        )}
      </div>

      <div className="flex border-b border-border-dark">
        <button 
            onClick={() => setActiveTab('hero')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'hero' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
            {t('admin.banners.tabs.hero')}
        </button>
        <button 
            onClick={() => setActiveTab('popup')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'popup' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
            {t('admin.banners.tabs.popup')}
        </button>
      </div>

      {activeTab === 'hero' ? (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {banners.map((banner) => (
            <div key={banner.id} className={`group relative rounded-3xl overflow-hidden border transition-all ${banner.isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border-dark bg-surface-dark'}`}>
                <div className="relative h-64 w-full overflow-hidden">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
                        <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-lg w-fit mb-3">{banner.badge}</span>
                        <h2 className="text-3xl font-black text-white mb-2 leading-tight max-w-2xl">{banner.title}</h2>
                        <p className="text-slate-300 text-sm mb-4 max-w-lg line-clamp-2">{banner.subtitle}</p>
                        <button className="px-6 py-2 bg-white text-black font-bold rounded-xl w-fit text-xs uppercase">{banner.buttonText}</button>
                    </div>
                </div>

                <div className="p-4 bg-background-dark/90 backdrop-blur border-t border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${banner.isActive ? 'bg-primary' : 'bg-slate-700'}`} onClick={() => toggleActive(banner.id)}>
                                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${banner.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <span className={`text-sm font-bold ${banner.isActive ? 'text-white' : 'text-slate-500'}`}>
                                {banner.isActive ? t('admin.banners.active') : t('admin.banners.hidden')}
                            </span>
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" icon="edit" onClick={() => handleEdit(banner)}>{t('common.edit')}</Button>
                        <Button size="sm" variant="danger" icon="delete" onClick={() => handleDelete(banner.id)}>{t('common.delete')}</Button>
                    </div>
                </div>
            </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-surface-dark border border-border-dark rounded-3xl p-8 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-border-dark">
                <h3 className="text-lg font-bold text-white">{t('admin.banners.popupConfigTitle')}</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <span className={`text-sm font-bold ${popupConfig.isActive ? 'text-primary' : 'text-slate-500'}`}>
                            {popupConfig.isActive ? t('common.enabled') : t('common.disabled')}
                        </span>
                        <div 
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${popupConfig.isActive ? 'bg-primary' : 'bg-slate-700'}`} 
                            onClick={() => setPopupConfig({...popupConfig, isActive: !popupConfig.isActive})}
                        >
                            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${popupConfig.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </label>
                </div>

                <div className="space-y-4">
                    <Input 
                        label={t('admin.banners.input.imageUrl')} 
                        placeholder="https://..." 
                        value={popupConfig.imageUrl}
                        onChange={(e) => setPopupConfig({...popupConfig, imageUrl: e.target.value})}
                    />
                    <Input 
                        label={t('admin.banners.input.link')} 
                        placeholder="/catalog" 
                        value={popupConfig.link}
                        onChange={(e) => setPopupConfig({...popupConfig, link: e.target.value})}
                    />
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Tần suất hiển thị</label>
                        <select 
                            className="w-full h-12 bg-background-dark border border-border-dark rounded-xl px-4 text-white focus:border-primary outline-none cursor-pointer"
                            value={popupConfig.frequency}
                            onChange={(e) => setPopupConfig({...popupConfig, frequency: e.target.value as any})}
                        >
                            <option value="once_session">{t('admin.banners.popup.frequency.onceSession')}</option>
                            <option value="always">{t('admin.banners.popup.frequency.always')}</option>
                        </select>
                        <p className="text-[10px] text-slate-500 italic mt-1">{t('admin.banners.popup.note')}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border-dark flex justify-end">
                    <Button onClick={handleSavePopup} icon="save">{t('admin.banners.saveConfig')}</Button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Xem trước hiển thị</h3>
                <div className="relative w-full h-[500px] bg-background-dark border border-border-dark rounded-3xl overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                    <div className={`relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${!popupConfig.isActive ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                        <div className="absolute top-2 right-2 z-10">
                            <button className="size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80">
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <img 
                            src={popupConfig.imageUrl} 
                            alt="Popup Preview" 
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                            <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs uppercase shadow-lg">Xem ngay</button>
                        </div>
                    </div>
                    {!popupConfig.isActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">POP-UP ĐANG TẮT</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? t('admin.banners.editModalTitle') : t('admin.banners.addModalTitle')}
        size="2xl"
        footer={
            <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                <Button variant="primary" onClick={handleSave}>{t('admin.banners.saveBanner')}</Button>
            </>
        }
      >
        <div className="space-y-5">
            <Input 
                label="Tiêu đề chính (Title)" 
                placeholder="VD: NEXT LEVEL GAMING..." 
                value={formData.title as any}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <Textarea 
                label="Mô tả ngắn (Subtitle)" 
                placeholder="Mô tả chiến dịch..." 
                value={formData.subtitle as any}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="h-24"
            />
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Nhãn (Badge)" 
                    placeholder="VD: Flagship Series" 
                    value={formData.badge as any}
                    onChange={(e) => setFormData({...formData, badge: e.target.value})}
                />
                <Input 
                    label="Nút bấm (Button Text)" 
                    placeholder="VD: Mua ngay" 
                    value={formData.buttonText as any}
                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                />
            </div>
            <Input 
                label="Đường dẫn ảnh (Image URL)" 
                placeholder="https://..." 
                value={formData.imageUrl as any}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            />
            <Input 
                label="Link đích khi click" 
                placeholder="/catalog" 
                value={formData.link as any}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
            />
            
            {formData.imageUrl && (
                <div className="mt-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Xem trước ảnh</p>
                    <img src={formData.imageUrl as any} className="w-full h-40 object-cover rounded-xl border border-border-dark" alt="Preview" />
                </div>
            )}
        </div>
      </Modal>
    </div>
  );
};

export default BannerManagement;


