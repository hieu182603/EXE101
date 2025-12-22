
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '@components/ui/Button';
import ProductCard from '@components/store/ProductCard';
import { productService } from '@services/productService';
import { feedbackService } from '@services/feedbackService';
import type { Product } from '@types/product';
import type { Feedback } from '@services/feedbackService';

interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Product data
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');

  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load product details
        const productData = await productService.getProductById(id);
        if (productData) {
          setProduct(productData);
          
          // Set main image from product images
          if (productData.images && productData.images.length > 0) {
            // mainImage will be set below
          }
          
          // Load related products by category
          if (productData.categoryId) {
            const related = await productService.getProductsByCategory(productData.categoryId);
            // Filter out current product and limit to 4
            const filtered = related
              .filter(p => p.id !== id)
              .slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
        
        // Load reviews/feedbacks
        const feedbacks = await feedbackService.getFeedbacksByProduct(id);
        // Transform Feedback[] to Review[]
        const transformedReviews: Review[] = feedbacks.map((fb: Feedback, index: number) => ({
          id: parseInt(fb.id) || index,
          user: fb.account?.name || fb.account?.username || 'Anonymous',
          rating: 5, // Backend may not have rating field
          comment: fb.content,
          date: fb.createdAt ? new Date(fb.createdAt).toLocaleDateString('vi-VN') : 'N/A',
          avatar: `https://picsum.photos/200/200?random=user${index}`
        }));
        setReviews(transformedReviews);
      } catch (error) {
        console.error('Error loading product data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  // Set main image when product loads
  const [mainImage, setMainImage] = useState(`https://picsum.photos/800/800?random=${id}`);
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setMainImage(product.images[0].url);
    }
  }, [product]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (isAdded) return;
    setIsAdded(true);
    // Simulate API call/State update
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleSubmitReview = () => {
    if (!userComment.trim()) return;
    
    const newReview: Review = {
      id: Date.now(),
      user: 'Alex User', // Mock logged in user
      rating: userRating,
      comment: userComment,
      date: 'Vừa xong',
      avatar: 'https://picsum.photos/200/200?random=user'
    };

    setReviews([newReview, ...reviews]);
    setUserComment('');
    setUserRating(5);
  };

  // Generate thumbnails from product images
  const thumbnails = product?.images && product.images.length > 0
    ? product.images.map(img => img.url)
    : [`https://picsum.photos/800/800?random=${id}`];

  // Mock specs - backend may not have this structured data
  const specs = product ? [
    { label: 'Tên sản phẩm', value: product.name },
    { label: 'Danh mục', value: product.category?.name || 'N/A' },
    { label: 'Giá', value: `${product.price.toLocaleString('vi-VN')}₫` },
    { label: 'Tồn kho', value: `${product.stock} sản phẩm` },
    { label: 'Mô tả', value: product.description || 'N/A' },
  ] : [];

  // Transform related products for ProductCard
  const relatedProductsDisplay = relatedProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: `${p.price.toLocaleString('vi-VN')}₫`,
    tag: p.stock === 0 ? 'Hết hàng' : undefined
  }));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-[1440px]">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-[1440px]">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-slate-600 mb-4 block">inventory_2</span>
          <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-slate-400 mb-6">Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/catalog">
            <Button>Quay lại cửa hàng</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1440px]">
      <div className="flex flex-col lg:flex-row gap-12 mb-20">
        {/* Gallery */}
        <div className="flex-1 space-y-4">
          <div 
            ref={imageRef}
            className="group relative aspect-square rounded-3xl bg-surface-dark border border-border-dark overflow-hidden flex items-center justify-center cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
             <img 
                src={mainImage} 
                className="w-full h-full object-contain transition-transform duration-300 ease-out pointer-events-none" 
                style={{ 
                  transform: isZooming ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
                alt="Product" 
             />
             {!isZooming && (
               <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 pointer-events-none">
                 <span className="material-symbols-outlined text-primary text-sm">zoom_in</span>
                 <span className="text-[10px] font-bold text-white uppercase tracking-wider">Hover to zoom</span>
               </div>
             )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {thumbnails.map((img, i) => (
              <div 
                key={i} 
                onClick={() => setMainImage(img)}
                className={`aspect-square rounded-2xl bg-surface-dark border overflow-hidden cursor-pointer transition-all p-3 flex items-center justify-center ${
                  mainImage === img ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border-dark hover:border-slate-500'
                }`}
              >
                <img src={img} className="w-full h-full object-contain" alt="Thumbnail" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20 inline-block">Flagship</span>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20 inline-block">Sẵn hàng</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined text-[18px] fill">star</span>)}
              </div>
              <span className="text-sm text-slate-500 font-medium">{reviews.length} đánh giá</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 border-y border-border-dark py-6">
            <span className="text-4xl font-black text-primary">{product.price.toLocaleString('vi-VN')}₫</span>
            {product.stock === 0 && (
              <span className="ml-2 text-red-500 font-bold text-sm">Hết hàng</span>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <span className="ml-2 text-yellow-500 font-bold text-sm">Còn {product.stock} sản phẩm</span>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tính năng nổi bật</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-300">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">verified</span> Hàng chính hãng 100%</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">bolt</span> Hiệu năng vượt trội</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">shuttle</span> Miễn phí vận chuyển</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">headset_mic</span> Hỗ trợ kỹ thuật 24/7</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center bg-background-dark border border-border-dark rounded-2xl p-1 h-14">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="w-12 text-center font-bold text-white text-lg">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="size-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            <button 
              onClick={handleAddToCart}
              className={`flex-1 h-14 font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group ${
                isAdded 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-primary text-black hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]'
              }`}
            >
              <span className={`material-symbols-outlined ${!isAdded && 'group-hover:rotate-12'} transition-transform`}>
                {isAdded ? 'check_circle' : 'shopping_cart'}
              </span>
              {isAdded ? 'ĐÃ THÊM VÀO GIỎ' : 'THÊM VÀO GIỎ HÀNG'}
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`size-14 rounded-2xl border flex items-center justify-center transition-all active:scale-90 bg-surface-dark/50 ${
                isFavorite 
                ? 'border-red-500 text-red-500 bg-red-500/10' 
                : 'border-border-dark text-slate-500 hover:text-red-500 hover:border-red-500/50'
              }`}
            >
              <span className={`material-symbols-outlined ${isFavorite ? 'fill' : ''}`}>favorite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-20">
        <div className="flex border-b border-border-dark mb-8">
          {[
            { id: 'specs', label: 'Thông số kỹ thuật' },
            { id: 'reviews', label: `Đánh giá (${reviews.length})` }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}
            </button>
          ))}
        </div>

        <div className="bg-surface-dark/50 rounded-3xl border border-border-dark p-8 min-h-[400px]">
          {activeTab === 'specs' && (
            <div className="max-w-4xl">
              <table className="w-full">
                <tbody>
                  {specs.map((spec, i) => (
                    <tr key={i} className="border-b border-border-dark/50 last:border-0">
                      <td className="py-4 text-slate-500 font-bold text-sm w-1/3 uppercase tracking-wider">{spec.label}</td>
                      <td className="py-4 text-white font-medium">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="space-y-12">
              {/* Review Summary */}
              <div className="flex flex-col md:flex-row gap-8 items-center bg-background-dark/30 p-8 rounded-2xl border border-border-dark/50">
                <div className="text-center">
                  <div className="text-5xl font-black text-white mb-2">4.9</div>
                  <div className="flex justify-center text-yellow-400 mb-2">
                    {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined fill text-sm">star</span>)}
                  </div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Dựa trên {reviews.length} đánh giá</div>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 w-4">{star}</span>
                      <div className="flex-1 h-1.5 bg-border-dark rounded-full overflow-hidden">
                        <div className={`h-full bg-primary`} style={{ width: star === 5 ? '85%' : star === 4 ? '12%' : '1%' }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 w-10 text-right">{star === 5 ? '85%' : star === 4 ? '12%' : '1%'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Review Form */}
              <div className="bg-surface-accent/20 p-6 rounded-2xl border border-border-dark/50">
                  <h4 className="text-lg font-bold text-white mb-4">Viết đánh giá của bạn</h4>
                  <div className="flex gap-4 items-start">
                      <div className="size-12 rounded-full overflow-hidden border border-border-dark shrink-0 hidden sm:block">
                          <img src="https://picsum.photos/200/200?random=user" alt="User" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                  <button 
                                    key={star} 
                                    type="button"
                                    onClick={() => setUserRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                  >
                                      <span className={`material-symbols-outlined text-2xl ${star <= userRating ? 'text-yellow-400 fill' : 'text-slate-600'}`}>star</span>
                                  </button>
                              ))}
                              <span className="ml-2 text-sm text-slate-400 font-medium">
                                {userRating === 5 ? 'Tuyệt vời' : userRating === 4 ? 'Rất tốt' : userRating === 3 ? 'Bình thường' : 'Tệ'}
                              </span>
                          </div>
                          
                          <div className="relative">
                            <textarea 
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..." 
                                className="w-full bg-background-dark border border-border-dark rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px] placeholder:text-slate-600"
                            ></textarea>
                          </div>
                          
                          <div className="flex justify-end">
                              <Button onClick={handleSubmitReview} disabled={!userComment.trim()} variant="primary" size="sm">
                                  Gửi đánh giá
                              </Button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                 {reviews.map((review) => (
                   <div key={review.id} className="border-b border-border-dark/30 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                          <div className="size-10 rounded-full overflow-hidden border border-border-dark shrink-0">
                              <img src={review.avatar} alt={review.user} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h5 className="font-bold text-white text-sm">{review.user}</h5>
                                      <div className="flex items-center gap-2 mt-0.5">
                                          <div className="flex text-yellow-400">
                                              {[...Array(5)].map((_, i) => (
                                                  <span key={i} className={`material-symbols-outlined text-[12px] ${i < review.rating ? 'fill' : 'text-slate-700'}`}>star</span>
                                              ))}
                                          </div>
                                          <span className="text-[10px] text-slate-500">• {review.date}</span>
                                      </div>
                                  </div>
                                  {review.user === 'Alex User' && (
                                     <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Của bạn</span>
                                  )}
                              </div>
                              <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h3 className="text-2xl font-black text-white tracking-tight mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">dynamic_feed</span>
          Sản phẩm liên quan
        </h3>
        {relatedProductsDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProductsDisplay.map((p, i) => (
              <ProductCard 
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                tag={p.tag}
                imageIndex={parseInt(p.id) + 100}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
            <p>Chưa có sản phẩm liên quan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
