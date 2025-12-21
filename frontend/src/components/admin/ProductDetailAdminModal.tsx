import React, { useEffect, useState } from 'react';
import type { Product } from '../../types/product';

interface ProductDetailAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onEdit?: (product: Product) => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  maxWidth: 600,
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: 32,
  animation: 'modalEnter 0.2s ease-out',
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  background: 'none',
  border: 'none',
  fontSize: 24,
  cursor: 'pointer',
  color: '#888',
};

import { formatDate } from '../../utils/dateFormatter';

const ProductDetailAdminModal: React.FC<ProductDetailAdminModalProps> = ({ isOpen, onClose, product, onEdit }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const categoryName = product.category?.name;

  const renderDetail = () => {
    const get = (field: string) => {
      if (product && product[field] !== undefined && product[field] !== null) return product[field];
      return '-';
    };
    const getBoolean = (field: string) => {
      const value = get(field);
      if (value === '-') return '-';
      return value ? 'Có' : 'Không';
    };
    if (categoryName === 'Laptop') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Screen size:</b> {get('screenSize') !== '-' && get('screenSize') !== null ? `${get('screenSize')}` : '-'}</div>
        <div><b>Screen type:</b> {get('screenType')}</div>
        <div><b>Resolution:</b> {get('resolution')}</div>
        <div><b>Battery life:</b> {get('batteryLifeHours') !== '-' && get('batteryLifeHours') !== null ? `${get('batteryLifeHours')} h` : '-'}</div>
        <div><b>Weight:</b> {get('weightKg') !== '-' && get('weightKg') !== null ? `${get('weightKg')} kg` : '-'}</div>
        <div><b>OS:</b> {get('os')}</div>
        <div><b>RAM count:</b> {get('ramCount')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'PC') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Processor:</b> {get('processor')}</div>
        <div><b>RAM:</b> {get('ramGb') !== '-' && get('ramGb') !== null ? `${get('ramGb')} GB` : '-'}</div>
        <div><b>Storage:</b> {get('storageGb') !== '-' && get('storageGb') !== null ? `${get('storageGb')} GB` : '-'}</div>
        <div><b>Storage type:</b> {get('storageType')}</div>
        <div><b>Graphics:</b> {get('graphics')}</div>
        <div><b>Form factor:</b> {get('formFactor')}</div>
        <div><b>Power supply:</b> {get('powerSupplyWattage') !== '-' && get('powerSupplyWattage') !== null ? `${get('powerSupplyWattage')} W` : '-'}</div>
        <div><b>OS:</b> {get('operatingSystem')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Drive') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Capacity:</b> {get('capacityGb') !== '-' && get('capacityGb') !== null ? `${get('capacityGb')} GB` : '-'}</div>
        <div><b>Interface:</b> {get('interface')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Monitor') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Size:</b> {get('sizeInch') !== '-' && get('sizeInch') !== null ? `${get('sizeInch')}` : '-'}</div>
        <div><b>Resolution:</b> {get('resolution')}</div>
        <div><b>Refresh rate:</b> {get('refreshRate') !== '-' && get('refreshRate') !== null ? `${get('refreshRate')} Hz` : '-'}</div>
        <div><b>Panel type:</b> {get('panelType')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'CPU') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Cores:</b> {get('cores')}</div>
        <div><b>Threads:</b> {get('threads')}</div>
        <div><b>Base Clock:</b> {get('baseClock')}</div>
        <div><b>Boost Clock:</b> {get('boostClock')}</div>
        <div><b>Socket:</b> {get('socket')}</div>
        <div><b>Architecture:</b> {get('architecture')}</div>
        <div><b>TDP:</b> {get('tdp') !== '-' ? `${get('tdp')}W` : '-'}</div>
        <div><b>Integrated Graphics:</b> {get('integratedGraphics')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Cooler') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Supported sockets:</b> {get('supportedSockets')}</div>
        <div><b>Fan size:</b> {get('fanSizeMm') !== '-' ? `${get('fanSizeMm')} mm` : '-'}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'RAM') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Capacity:</b> {get('capacityGb') !== '-' && get('capacityGb') !== null ? `${get('capacityGb')} GB` : '-'}</div>
        <div><b>Speed:</b> {get('speedMhz') !== '-' && get('speedMhz') !== null ? `${get('speedMhz')} MHz` : '-'}</div>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'PSU') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Wattage:</b> {get('wattage') !== '-' && get('wattage') !== null ? `${get('wattage')} W` : '-'}</div>
        <div><b>Efficiency rating:</b> {get('efficiencyRating')}</div>
        <div><b>Modular:</b> {get('modular')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Case') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Form factor support:</b> {get('formFactorSupport')}</div>
        <div><b>Has RGB:</b> {getBoolean('hasRgb')}</div>
        <div><b>Side panel type:</b> {get('sidePanelType')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Headset') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Has microphone:</b> {getBoolean('hasMicrophone')}</div>
        <div><b>Connectivity:</b> {get('connectivity')}</div>
        <div><b>Surround sound:</b> {getBoolean('surroundSound')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Motherboard') {
      return <>
        <div><b>Description:</b> {get('description')}</div>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Chipset:</b> {get('chipset')}</div>
        <div><b>Socket:</b> {get('socket')}</div>
        <div><b>Form factor:</b> {get('formFactor')}</div>
        <div><b>RAM slots:</b> {get('ramSlots')}</div>
        <div><b>Max RAM:</b> {get('maxRam') !== '-' ? `${get('maxRam')} GB` : '-'}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Keyboard') {
      return <>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Switch type:</b> {get('switchType')}</div>
        <div><b>Connectivity:</b> {get('connectivity')}</div>
        <div><b>Layout:</b> {get('layout')}</div>
        <div><b>Has RGB:</b> {getBoolean('hasRgb')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'GPU') {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>VRAM:</b> {get('vram') !== '-' && get('vram') !== null ? `${get('vram')} GB` : '-'}</div>
        <div><b>Chipset:</b> {get('chipset')}</div>
        <div><b>Memory type:</b> {get('memoryType')}</div>
        <div><b>Length:</b> {get('lengthMm') !== '-' && get('lengthMm') !== null ? `${get('lengthMm')} mm` : '-'}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Mouse') {
      return <>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>DPI:</b> {get('dpi') !== '-' ? `${get('dpi')}` : '-'}</div>
        <div><b>Connectivity:</b> {get('connectivity')}</div>
        <div><b>Has RGB:</b> {getBoolean('hasRgb')}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    if (categoryName === 'Network Card') {
      return <>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Interface:</b> {get('interface')}</div>
        <div><b>Speed:</b> {get('speedMbps') !== '-' && get('speedMbps') !== null ? `${get('speedMbps')} Mbps` : '-'}</div>
        <div><b>Stock:</b> {get('stock')}</div>
      </>;
    }
    // Trường hợp mặc định
    return <>
      <div><b>Mô tả:</b> {get('description')}</div>
      <div><b>Tồn kho:</b> {get('stock')}</div>
      <div><b>Trạng thái:</b> {get('isActive') ? 'Hoạt động' : 'Không hoạt động'}</div>
      <div><b>Ngày tạo:</b> {formatDate(get('createdAt'))}</div>
      <div><b>Ngày cập nhật:</b> {formatDate(get('updatedAt'))}</div>
    </>;
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose} title="Đóng">×</button>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
          {product.images && product.images.length > 0 && (
            <img
              src={product.images[0].url}
              alt={product.name}
              style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 12, background: '#f5f5f5' }}
            />
          )}
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h3 style={{ margin: 0 }}>{product.name}</h3>
            <div style={{ color: '#ff2d55', fontWeight: 700, fontSize: 20, margin: '8px 0' }}>
              {product.price ? product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'Giá không có sẵn'}
            </div>
            <div style={{ marginBottom: 8 }}><b>Category:</b> {product.category?.name || 'Không có danh mục'}</div>
            {renderDetail()}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            style={{
              background: '#ffb300',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onClick={() => onEdit && onEdit(product)}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailAdminModal; 