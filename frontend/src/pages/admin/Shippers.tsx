
import React, { useState, useEffect } from 'react';
import { shipperService } from '@services/shipperService';
import { useTranslation } from '../../hooks/useTranslation';

const ShipperManagement: React.FC = () => {
  const [shippers, setShippers] = useState<Array<{ id: string; name: string; area: string; status: string; rating: number; completed: number }>>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Load shippers
  useEffect(() => {
    const loadShippers = async () => {
      try {
        setLoading(true);
        const response = await shipperService.getAllShippers();
        const shippersData = response.data || [];
        
        // Transform backend shippers to display format
        const transformedShippers = await Promise.all(shippersData.map(async (s: any) => {
          // Get statistics for each shipper
          let statistics = null;
          try {
            const statsResponse = await shipperService.getShipperStatistics(s.id);
            statistics = statsResponse.data;
          } catch (error) {
            console.error(`Error loading statistics for shipper ${s.id}:`, error);
          }
          
          return {
            id: s.id,
            name: s.fullName || s.name || s.username || 'Unknown',
            area: (s.workingZones || []).join(', ') || 'N/A',
            status: s.isAvailable ? 'Đang hoạt động' : 'Không hoạt động',
            rating: statistics?.rating || 5.0,
            completed: statistics?.deliveredOrders || 0
          };
        }));
        
        setShippers(transformedShippers);
      } catch (error) {
        console.error('Error loading shippers:', error);
        setShippers([]);
      } finally {
        setLoading(false);
      }
    };

    loadShippers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('admin.shippers.title')}</h1>
          <p className="text-gray-400 mt-1">{t('admin.shippers.subtitle')}</p>
        </div>
        <button className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-background-dark hover:brightness-110 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          {t('admin.shippers.add')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">{t('admin.shippers.loading')}</p>
        </div>
      ) : shippers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shippers.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border-dark bg-surface-dark p-6 hover:border-primary/50 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-surface-accent flex items-center justify-center border border-border-dark overflow-hidden">
                <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
              </div>
              <div>
                <h3 className="font-bold text-white">{s.name}</h3>
                <p className="text-xs text-gray-500">#{s.id}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Khu vực:</span>
                <span className="text-white font-medium">{s.area}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Đánh giá:</span>
                <span className="text-yellow-400 font-bold flex items-center gap-1">
                  {s.rating} <span className="material-symbols-outlined text-sm fill">star</span>
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Hoàn thành:</span>
                <span className="text-primary font-bold">{s.completed}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                s.status === 'Đang hoạt động' ? 'bg-emerald-500/10 text-emerald-400' : 
                s.status === 'Đang giao hàng' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'
              }`}>
                {s.status}
              </span>
              <button className="text-primary text-xs font-bold hover:underline">Chi tiết</button>
            </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <span className="material-symbols-outlined text-6xl mb-4 block">local_shipping</span>
          <p>{t('admin.shippers.noShippers')}</p>
        </div>
      )}
    </div>
  );
};

export default ShipperManagement;
