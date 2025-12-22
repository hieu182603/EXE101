
import React, { useState, useEffect } from 'react';
import { feedbackService } from '@services/feedbackService';
import type { Feedback } from '@services/feedbackService';

const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Array<{ id: string; user: string; product: string; rating: number; comment: string; date: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Load feedbacks
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setLoading(true);
        const feedbacksData = await feedbackService.getAllFeedbacks();
        
        // Transform Feedback[] to display format
        const transformedFeedbacks = feedbacksData.map((fb: Feedback) => ({
          id: fb.id,
          user: fb.account?.name || fb.account?.username || 'Anonymous',
          product: fb.product?.name || 'Unknown Product',
          rating: 5, // Backend may not have rating field
          comment: fb.content,
          date: new Date(fb.createdAt).toLocaleDateString('vi-VN')
        }));
        
        setFeedbacks(transformedFeedbacks);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-tight">Phản Hồi Khách Hàng</h1>
      {loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải phản hồi...</p>
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-4">
          {feedbacks.map((f) => (
          <div key={f.id} className="rounded-2xl border border-border-dark bg-surface-dark p-6 transition-all hover:bg-surface-accent">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-background-dark border border-border-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-500">person</span>
                </div>
                <div>
                  <h3 className="font-bold text-white">{f.user}</h3>
                  <p className="text-xs text-primary">về: {f.product}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{f.date}</span>
            </div>
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`material-symbols-outlined text-sm ${i < f.rating ? 'text-yellow-400 fill' : 'text-gray-600'}`}>star</span>
              ))}
            </div>
            <p className="text-gray-300 text-sm italic">"{f.comment}"</p>
            <div className="mt-4 flex gap-3">
              <button className="text-xs font-bold text-primary hover:underline">Phản hồi</button>
              <button className="text-xs font-bold text-gray-500 hover:text-red-400">Ẩn</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <span className="material-symbols-outlined text-6xl mb-4 block">feedback</span>
          <p>Chưa có phản hồi nào</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
