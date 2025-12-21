import React, { useEffect, useState } from 'react';
import type { FilterState, Category, ProductCategory } from '../../types/product';
import { productService } from '../../services/productService';

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORY_FILTERS_ORDER = [
  'laptop', 'pc', 'drive', 'monitor', 'cpu', 'cooler', 'ram', 'psu', 'case', 'headset', 'motherboard', 'keyboard', 'gpu', 'mouse', 'network card'
];

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categoryCounts = {},
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await productService.getCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  const handleCategoryToggle = (categorySlug: string) => {
    const catSlug = categorySlug as ProductCategory;
    if (!catSlug) return;
    const isSelected = filters.categories.includes(catSlug);
    const newCategories = isSelected
      ? filters.categories.filter((slug) => slug !== catSlug)
      : [...filters.categories, catSlug];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleClear = () => {
    onFiltersChange({ ...filters, categories: [] });
  };

  // Sắp xếp categories theo thứ tự CATEGORY_FILTERS_ORDER
  const sortedCategories = [...categories].sort((a, b) => {
    const idxA = CATEGORY_FILTERS_ORDER.indexOf(a.slug.toLowerCase());
    const idxB = CATEGORY_FILTERS_ORDER.indexOf(b.slug.toLowerCase());
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontWeight: 400, fontSize: 17, color: '#23272e' }}>Filter by type</h2>
        <button onClick={handleClear} style={{ color: '#e53935', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 400, fontSize: 13 }}>Clear all</button>
      </div>
      <div style={{ fontWeight: 400, fontSize: 13, marginBottom: 18, color: '#23272e', textAlign: 'left' }}>Categories</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sortedCategories.map((cat) => (
          <label key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.slug as ProductCategory)}
                onChange={() => handleCategoryToggle(cat.slug)}
                style={{ width: 16, height: 16, accentColor: filters.categories.includes(cat.slug as ProductCategory) ? '#e53935' : undefined }}
              />
              <span>{cat.name}</span>
            </span>
            <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: '50%', width: 28, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, fontSize: 13 }}>
              {categoryCounts[cat.slug] || 0}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters; 