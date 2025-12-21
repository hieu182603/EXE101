import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../../types/product';

interface ProductAddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<Product>) => void;
  categories: Category[];
}

const ProductAddAdminModal: React.FC<ProductAddAdminModalProps> = ({ isOpen, onClose, onSubmit, categories }) => {
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [form, setForm] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCategoryId('');
      setForm({});
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategorySelect = (catId: string) => {
    setCategoryId(catId);
    setForm({});
    setStep(2);
  };

  const normalizeString = (str: string) => str.replace(/\s+/g, ' ').trim();

  const validateField = (field: string, value: any) => {
    if (typeof value === 'string') {
      if (!value.trim()) return 'Cannot be empty';
      if (/^\s/.test(value)) return 'Cannot start with a space';
      // No check for multiple consecutive spaces
    }
    if (typeof value === 'number' || /^\d+$/.test(value)) {
      if (value === '' || value === undefined || value === null) return 'Cannot be empty';
      if (Number(value) <= 0) return 'Must be greater than 0';
    }
    return '';
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const err = validateField(key, value);
        if (err) newErrors[key] = err;
      }
    });
    if (!categoryId) newErrors['categoryId'] = 'Please select a product category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: unknown) => {
    let newValue = value;
    if (typeof value === 'string') {
      // Tự động chuẩn hóa nhiều dấu cách liên tiếp thành 1
      newValue = value.replace(/\s{2,}/g, ' ');
    }
    setForm(prev => ({ ...prev, [field]: newValue }));
    let err = '';
    if (typeof newValue === 'string' || typeof newValue === 'number') {
      err = validateField(field, newValue);
    }
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    // Chuẩn hóa string
    const normalizedForm: Record<string, unknown> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (typeof v === 'string') normalizedForm[k] = normalizeString(v);
      else normalizedForm[k] = v;
    });
    // Ép kiểu price, stock, capacityGb, speedMhz về number nếu có
    const payload: Partial<Product> = {
      ...normalizedForm,
      name: typeof normalizedForm.name === 'string' ? normalizedForm.name : '',
      price: normalizedForm.price !== undefined ? Number(normalizedForm.price) : 0,
      stock: normalizedForm.stock !== undefined ? Number(normalizedForm.stock) : 0,
      categoryId,
      capacityGb: normalizedForm.capacityGb !== undefined ? Number(normalizedForm.capacityGb) : undefined,
      speedMhz: normalizedForm.speedMhz !== undefined ? Number(normalizedForm.speedMhz) : undefined,
    };
    console.log('Payload gửi lên backend:', payload);
    onSubmit(payload);
  };

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontWeight: 400, fontSize: 16, marginTop: 4 };
  const labelStyle = { textAlign: 'left' as const, fontWeight: 500, marginBottom: 4, display: 'block' };

  const laptopBrands = ["Acer", "Asus", "Dell", "HP", "Alienware", "Lenovo", "MSI", "Gigabyte"];
  const laptopOS = ["Windows 11", "Windows 11 Pro", "Windows 10", "Windows 10 Pro", "macOS"];
  const ramBrands = ["Kingston", "Corsair", "G.Skill", "Patriot", "TeamGroup", "Crucial", "HYNIX", "Lexar"];
  const ramTypes = ["DDR3", "DDR4", "DDR5"];
  const cpuSockets = ["LGA 1700", "LGA 1200", "LGA 1151", "AM4", "AM5", "TR4", "sTRX4"];
  const gpuMemoryTypes = ["GDDR3", "GDDR5", "GDDR5X", "GDDR6"];
  const monitorPanelTypes = ["IPS", "VA", "Oled"];
  const monitorBrands = ["MSI", "AOC", "LG", "ASUS", "Samsung", "ViewSonic", "Gigabyte", "Dell", "Edra"];
  const motherboardBrands = ["Asus", "ASRock", "Gigabyte", "MSI", "VSP"];
  const motherboardFormFactors = ["ATX", "mATX", "Mini-ITX", "E-ATX"];
  const psuBrands = ["Cooler Master", "Seasonic", "EVGA", "Corsair", "Thelmaltake", "be quiet!", "Gigabyte", "NZXT"];
  const psuEfficiencyRatings = ["80 Plus", "80 Plus Bronze", "80 Plus Silver", "80 Plus Gold", "80 Plus Platinum", "80 Plus Titanium", "80 Plus White"];
  const driveBrands = ["Seagate", "Crucial", "Western Digital", "Sabrent", "Samsung", "Kingston", "Patriot", "SK hynix"];
  const driveTypes = ["SSD", "HDD"];
  const coolerBrands = ["Cooler Master", "Scythe", "be quiet!", "Noctua", "Arctic", "NZXT", "Corsair", "Asus", "MSI"];
  const coolerTypes = ["Air", "Liquid"];
  const caseBrands = ["be quiet!", "Corsair", "NZXT", "Fractal Design", "Lian Li", "Phanteks", "Asus", "Edra", "Xigmatek", "Thermaltake"];
  const caseFormFactors = ["ATX", "mATX", "Mini-ITX", "E-ATX"];
  const mouseTypes = ["Gaming", "Office"];
  const mouseConnectivity = ["Wired", "Wireless"];
  const keyboardTypes = ["Wired", "Wireless"];
  const keyboardConnectivity = ["Wired", "Wireless", "Bluetooth"];
  const keyboardSwitchTypes = ["Mechanical", "Membrane", "Scissor Switch"];
  const keyboardLayouts = ["Full-size", "TKL", "75%", "60%"];
  const headsetConnectivity = ["Wired", "Wireless", "Bluetooth"];
  const networkCardTypes = ["Ethernet", "Wifi", "Bluetooth"];
  const networkCardInterfaces = ["PCIe", "USB", "M.2"];
  const pcBrands = ["Corsair", "MSI", "NZXT", "Alienware", "Origin", "Dell", "Asus", "Gigabyte", "Acer", "HP"];
  const pcFormFactors = ["Full Tower", "Mid Tower", "Mini Tower", "Desktop", "Compact"];
  const pcStorageTypes = ["NVMe SSD", "HDD", "SATA SSD"];
  const pcOS = ["Windows 11 Home", "Windows 11 Pro", "Windows 10 Home", "Windows 10 Pro", "macOS"];

  const renderFields = () => {
    if (!categoryId) return null;
    const catObj = categories.find(c => c.id === categoryId);
    const cat = catObj ? catObj.name.trim().toLowerCase() : '';
    const nameInput = <label style={labelStyle}>Product Name:<input style={inputStyle} value={form.name || ''} onChange={e => handleChange('name', e.target.value)} required /> {errors.name && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.name}</div>}</label>;
    const priceInput = <label style={labelStyle}>Price:<input style={inputStyle} type="number" value={form.price || ''} onChange={e => handleChange('price', e.target.value)} required min={0} /> {errors.price && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.price}</div>}</label>;
    const descInput = <label style={labelStyle}>Description:<textarea style={{...inputStyle, minHeight: 80, resize: 'vertical'}} value={form.description || ''} onChange={e => handleChange('description', e.target.value)} /> {errors.description && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.description}</div>}</label>;
    const stockInput = <label style={labelStyle}>Stock:<input style={inputStyle} type="number" value={form.stock || ''} onChange={e => handleChange('stock', e.target.value)} required min={0} /> {errors.stock && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.stock}</div>}</label>;
    if (cat === 'laptop') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {laptopBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Screen size:<input style={inputStyle} value={form.screenSize || ''} onChange={e => handleChange('screenSize', e.target.value)} /> {errors.screenSize && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.screenSize}</div>}</label>
        <label style={labelStyle}>Screen type:<input style={inputStyle} value={form.screenType || ''} onChange={e => handleChange('screenType', e.target.value)} /> {errors.screenType && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.screenType}</div>}</label>
        <label style={labelStyle}>Resolution:<input style={inputStyle} value={form.resolution || ''} onChange={e => handleChange('resolution', e.target.value)} /> {errors.resolution && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.resolution}</div>}</label>
        <label style={labelStyle}>Battery life:<input style={inputStyle} value={form.batteryLifeHours || ''} onChange={e => handleChange('batteryLifeHours', e.target.value)} /> {errors.batteryLifeHours && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.batteryLifeHours}</div>}</label>
        <label style={labelStyle}>Weight:<input style={inputStyle} value={form.weightKg || ''} onChange={e => handleChange('weightKg', e.target.value)} /> {errors.weightKg && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.weightKg}</div>}</label>
        <label style={labelStyle}>OS:<select style={inputStyle} value={form.os || ''} onChange={e => handleChange('os', e.target.value)}>
          <option value="">-- Select --</option>
          {laptopOS.map(o => <option key={o} value={o}>{o}</option>)}
        </select> {errors.os && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.os}</div>}</label>
        <label style={labelStyle}>RAM count:<input style={inputStyle} value={form.ramCount || ''} onChange={e => handleChange('ramCount', e.target.value)} /> {errors.ramCount && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.ramCount}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'ram') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {ramBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Capacity:<input style={inputStyle} value={form.capacityGb || ''} onChange={e => handleChange('capacityGb', e.target.value)} /> {errors.capacityGb && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.capacityGb}</div>}</label>
        <label style={labelStyle}>Speed:<input style={inputStyle} value={form.speedMhz || ''} onChange={e => handleChange('speedMhz', e.target.value)} /> {errors.speedMhz && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.speedMhz}</div>}</label>
        <label style={labelStyle}>Type:<select style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)}>
          <option value="">-- Select --</option>
          {ramTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select> {errors.type && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.type}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'cpu') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Cores:<input style={inputStyle} value={form.cores || ''} onChange={e => handleChange('cores', e.target.value)} /> {errors.cores && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.cores}</div>}</label>
        <label style={labelStyle}>Threads:<input style={inputStyle} value={form.threads || ''} onChange={e => handleChange('threads', e.target.value)} /> {errors.threads && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.threads}</div>}</label>
        <label style={labelStyle}>Base Clock:<input style={inputStyle} value={form.baseClock || ''} onChange={e => handleChange('baseClock', e.target.value)} /> {errors.baseClock && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.baseClock}</div>}</label>
        <label style={labelStyle}>Boost Clock:<input style={inputStyle} value={form.boostClock || ''} onChange={e => handleChange('boostClock', e.target.value)} /> {errors.boostClock && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.boostClock}</div>}</label>
        <label style={labelStyle}>Socket:<select style={inputStyle} value={form.socket || ''} onChange={e => handleChange('socket', e.target.value)}>
          <option value="">-- Select --</option>
          {cpuSockets.map(s => <option key={s} value={s}>{s}</option>)}
        </select> {errors.socket && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.socket}</div>}</label>
        <label style={labelStyle}>Architecture:<input style={inputStyle} value={form.architecture || ''} onChange={e => handleChange('architecture', e.target.value)} /> {errors.architecture && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.architecture}</div>}</label>
        <label style={labelStyle}>TDP:<input style={inputStyle} value={form.tdp || ''} onChange={e => handleChange('tdp', e.target.value)} /> {errors.tdp && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.tdp}</div>}</label>
        <label style={labelStyle}>Integrated Graphics:<input style={inputStyle} value={form.integratedGraphics || ''} onChange={e => handleChange('integratedGraphics', e.target.value)} /> {errors.integratedGraphics && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.integratedGraphics}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'gpu') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {monitorBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>VRAM:<input style={inputStyle} value={form.vram || ''} onChange={e => handleChange('vram', e.target.value)} /> {errors.vram && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.vram}</div>}</label>
        <label style={labelStyle}>Chipset:<input style={inputStyle} value={form.chipset || ''} onChange={e => handleChange('chipset', e.target.value)} /> {errors.chipset && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.chipset}</div>}</label>
        <label style={labelStyle}>Memory Type:<select style={inputStyle} value={form.memoryType || ''} onChange={e => handleChange('memoryType', e.target.value)}>
          <option value="">-- Select --</option>
          {gpuMemoryTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select> {errors.memoryType && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.memoryType}</div>}</label>
        <label style={labelStyle}>Length (mm):<input style={inputStyle} value={form.lengthMm || ''} onChange={e => handleChange('lengthMm', e.target.value)} /> {errors.lengthMm && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.lengthMm}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'monitor') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {monitorBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Size (inch):<input style={inputStyle} value={form.sizeInch || ''} onChange={e => handleChange('sizeInch', e.target.value)} /> {errors.sizeInch && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.sizeInch}</div>}</label>
        <label style={labelStyle}>Resolution:<input style={inputStyle} value={form.resolution || ''} onChange={e => handleChange('resolution', e.target.value)} /> {errors.resolution && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.resolution}</div>}</label>
        <label style={labelStyle}>Panel Type:<select style={inputStyle} value={form.panelType || ''} onChange={e => handleChange('panelType', e.target.value)}>
          <option value="">-- Select --</option>
          {monitorPanelTypes.map(p => <option key={p} value={p}>{p}</option>)}
        </select> {errors.panelType && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.panelType}</div>}</label>
        <label style={labelStyle}>Refresh Rate:<input style={inputStyle} value={form.refreshRate || ''} onChange={e => handleChange('refreshRate', e.target.value)} /> {errors.refreshRate && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.refreshRate}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'motherboard') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {motherboardBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Chipset:<input style={inputStyle} value={form.chipset || ''} onChange={e => handleChange('chipset', e.target.value)} /> {errors.chipset && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.chipset}</div>}</label>
        <label style={labelStyle}>Socket:<select style={inputStyle} value={form.socket || ''} onChange={e => handleChange('socket', e.target.value)}>
          <option value="">-- Select --</option>
          {cpuSockets.map(s => <option key={s} value={s}>{s}</option>)}
        </select> {errors.socket && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.socket}</div>}</label>
        <label style={labelStyle}>Form Factor:<select style={inputStyle} value={form.formFactor || ''} onChange={e => handleChange('formFactor', e.target.value)}>
          <option value="">-- Select --</option>
          {motherboardFormFactors.map(f => <option key={f} value={f}>{f}</option>)}
        </select> {errors.formFactor && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.formFactor}</div>}</label>
        <label style={labelStyle}>RAM Slots:<input style={inputStyle} value={form.ramSlots || ''} onChange={e => handleChange('ramSlots', e.target.value)} /> {errors.ramSlots && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.ramSlots}</div>}</label>
        <label style={labelStyle}>Max RAM:<input style={inputStyle} value={form.maxRam || ''} onChange={e => handleChange('maxRam', e.target.value)} /> {errors.maxRam && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.maxRam}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'headset') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Has Microphone:<input type="checkbox" checked={!!form.hasMicrophone} onChange={e => handleChange('hasMicrophone', e.target.checked)} /> {errors.hasMicrophone && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.hasMicrophone}</div>}</label>
        <label style={labelStyle}>Connectivity:<select style={inputStyle} value={form.connectivity || ''} onChange={e => handleChange('connectivity', e.target.value)}>
          <option value="">-- Select --</option>
          {headsetConnectivity.map(c => <option key={c} value={c}>{c}</option>)}
        </select> {errors.connectivity && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.connectivity}</div>}</label>
        <label style={labelStyle}>Surround Sound:<input type="checkbox" checked={!!form.surroundSound} onChange={e => handleChange('surroundSound', e.target.checked)} /> {errors.surroundSound && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.surroundSound}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'keyboard') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Type:<select style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)}>
          <option value="">-- Select --</option>
          {keyboardTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select> {errors.type && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.type}</div>}</label>
        <label style={labelStyle}>Switch Type:<select style={inputStyle} value={form.switchType || ''} onChange={e => handleChange('switchType', e.target.value)}>
          <option value="">-- Select --</option>
          {keyboardSwitchTypes.map(s => <option key={s} value={s}>{s}</option>)}
        </select> {errors.switchType && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.switchType}</div>}</label>
        <label style={labelStyle}>Connectivity:<select style={inputStyle} value={form.connectivity || ''} onChange={e => handleChange('connectivity', e.target.value)}>
          <option value="">-- Select --</option>
          {keyboardConnectivity.map(c => <option key={c} value={c}>{c}</option>)}
        </select> {errors.connectivity && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.connectivity}</div>}</label>
        <label style={labelStyle}>Layout:<select style={inputStyle} value={form.layout || ''} onChange={e => handleChange('layout', e.target.value)}>
          <option value="">-- Select --</option>
          {keyboardLayouts.map(l => <option key={l} value={l}>{l}</option>)}
        </select> {errors.layout && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.layout}</div>}</label>
        <label style={labelStyle}>Has RGB:<input type="checkbox" checked={!!form.hasRgb} onChange={e => handleChange('hasRgb', e.target.checked)} /> {errors.hasRgb && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.hasRgb}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'network card') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Type:<select style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)}>
          <option value="">-- Select --</option>
          {networkCardTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select> {errors.type && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.type}</div>}</label>
        <label style={labelStyle}>Interface:<select style={inputStyle} value={form.interface || ''} onChange={e => handleChange('interface', e.target.value)}>
          <option value="">-- Select --</option>
          {networkCardInterfaces.map(i => <option key={i} value={i}>{i}</option>)}
        </select> {errors.interface && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.interface}</div>}</label>
        <label style={labelStyle}>Speed (Mbps):<input style={inputStyle} type="number" value={form.speedMbps || ''} onChange={e => handleChange('speedMbps', e.target.value)} /> {errors.speedMbps && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.speedMbps}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'case') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {caseBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Form Factor Support:<select style={inputStyle} value={form.formFactorSupport || ''} onChange={e => handleChange('formFactorSupport', e.target.value)}>
          <option value="">-- Select --</option>
          {caseFormFactors.map(f => <option key={f} value={f}>{f}</option>)}
        </select> {errors.formFactorSupport && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.formFactorSupport}</div>}</label>
        <label style={labelStyle}>Has RGB:<input type="checkbox" checked={!!form.hasRgb} onChange={e => handleChange('hasRgb', e.target.checked)} /> {errors.hasRgb && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.hasRgb}</div>}</label>
        <label style={labelStyle}>Side Panel Type:<input style={inputStyle} value={form.sidePanelType || ''} onChange={e => handleChange('sidePanelType', e.target.value)} /> {errors.sidePanelType && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.sidePanelType}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'psu') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {psuBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Wattage:<input style={inputStyle} type="number" value={form.wattage || ''} onChange={e => handleChange('wattage', e.target.value)} /> {errors.wattage && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.wattage}</div>}</label>
        <label style={labelStyle}>Efficiency Rating:<select style={inputStyle} value={form.efficiencyRating || ''} onChange={e => handleChange('efficiencyRating', e.target.value)}>
          <option value="">-- Select --</option>
          {psuEfficiencyRatings.map(r => <option key={r} value={r}>{r}</option>)}
        </select> {errors.efficiencyRating && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.efficiencyRating}</div>}</label>
        <label style={labelStyle}>Modular:<input style={inputStyle} value={form.modular || ''} onChange={e => handleChange('modular', e.target.value)} /> {errors.modular && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.modular}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'pc') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {pcBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Processor:<input style={inputStyle} value={form.processor || ''} onChange={e => handleChange('processor', e.target.value)} /> {errors.processor && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.processor}</div>}</label>
        <label style={labelStyle}>RAM (GB):<input style={inputStyle} type="number" value={form.ramGb || ''} onChange={e => handleChange('ramGb', e.target.value)} /> {errors.ramGb && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.ramGb}</div>}</label>
        <label style={labelStyle}>Storage (GB):<input style={inputStyle} type="number" value={form.storageGb || ''} onChange={e => handleChange('storageGb', e.target.value)} /> {errors.storageGb && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.storageGb}</div>}</label>
        <label style={labelStyle}>Storage type:<select style={inputStyle} value={form.storageType || ''} onChange={e => handleChange('storageType', e.target.value)}>
          <option value="">-- Select --</option>
          {pcStorageTypes.map(s => <option key={s} value={s}>{s}</option>)}
        </select> {errors.storageType && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.storageType}</div>}</label>
        <label style={labelStyle}>Graphics:<input style={inputStyle} value={form.graphics || ''} onChange={e => handleChange('graphics', e.target.value)} /> {errors.graphics && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.graphics}</div>}</label>
        <label style={labelStyle}>Form factor:<select style={inputStyle} value={form.formFactor || ''} onChange={e => handleChange('formFactor', e.target.value)}>
          <option value="">-- Select --</option>
          {pcFormFactors.map(f => <option key={f} value={f}>{f}</option>)}
        </select> {errors.formFactor && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.formFactor}</div>}</label>
        <label style={labelStyle}>Power supply (W):<input style={inputStyle} type="number" value={form.powerSupplyWattage || ''} onChange={e => handleChange('powerSupplyWattage', e.target.value)} /> {errors.powerSupplyWattage && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.powerSupplyWattage}</div>}</label>
        <label style={labelStyle}>OS:<select style={inputStyle} value={form.operatingSystem || ''} onChange={e => handleChange('operatingSystem', e.target.value)}>
          <option value="">-- Select --</option>
          {pcOS.map(o => <option key={o} value={o}>{o}</option>)}
        </select> {errors.operatingSystem && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.operatingSystem}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'cooler') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {coolerBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Type:<select style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)}>
          <option value="">-- Select --</option>
          {coolerTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select> {errors.type && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.type}</div>}</label>
        <label style={labelStyle}>Supported sockets:<input style={inputStyle} value={form.supportedSockets || ''} onChange={e => handleChange('supportedSockets', e.target.value)} /> {errors.supportedSockets && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.supportedSockets}</div>}</label>
        <label style={labelStyle}>Fan size (mm):<input style={inputStyle} type="number" value={form.fanSizeMm || ''} onChange={e => handleChange('fanSizeMm', e.target.value)} /> {errors.fanSizeMm && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.fanSizeMm}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'drive') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<select style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)}>
          <option value="">-- Select --</option>
          {driveBrands.map(b => <option key={b} value={b}>{b}</option>)}
        </select> {errors.brand && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.brand}</div>}</label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Type:<select style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)}>
          <option value="">-- Select --</option>
          {driveTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select> {errors.type && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.type}</div>}</label>
        <label style={labelStyle}>Capacity (GB):<input style={inputStyle} type="number" value={form.capacityGb || ''} onChange={e => handleChange('capacityGb', e.target.value)} /> {errors.capacityGb && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.capacityGb}</div>}</label>
        <label style={labelStyle}>Interface:<input style={inputStyle} value={form.interface || ''} onChange={e => handleChange('interface', e.target.value)} /> {errors.interface && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.interface}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'mouse') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Type:<select style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)}>
          <option value="">-- Select --</option>
          {mouseTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select> {errors.type && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.type}</div>}</label>
        <label style={labelStyle}>DPI:<input style={inputStyle} type="number" value={form.dpi || ''} onChange={e => handleChange('dpi', e.target.value)} /> {errors.dpi && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.dpi}</div>}</label>
        <label style={labelStyle}>Connectivity:<select style={inputStyle} value={form.connectivity || ''} onChange={e => handleChange('connectivity', e.target.value)}>
          <option value="">-- Select --</option>
          {mouseConnectivity.map(c => <option key={c} value={c}>{c}</option>)}
        </select> {errors.connectivity && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.connectivity}</div>}</label>
        <label style={labelStyle}>Has RGB:<input type="checkbox" checked={!!form.hasRgb} onChange={e => handleChange('hasRgb', e.target.checked)} /> {errors.hasRgb && <div style={{color:'red',fontSize:13,marginTop:2}}>{errors.hasRgb}</div>}</label>
        {priceInput}
        {stockInput}
      </>;
    }
    // Mặc định
    return <>
      {nameInput}
      {descInput}
      {priceInput}
      {stockInput}
    </>;
  };

  const catObj = categoryId ? categories.find(c => c.id === categoryId) : null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <form style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <button type="button" style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, lineHeight: 1 }} onClick={onClose}>×</button>
        </div>
        <h2 style={{ textAlign: 'left', fontWeight: 700, fontSize: 28, marginBottom: 24, marginTop: 0 }}>
          {step === 2 && catObj ? `Add ${catObj.name}` : 'Add Product'}
        </h2>
        {step === 1 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Select product category:</label>
              <select style={inputStyle} value={categoryId} onChange={e => handleCategorySelect(e.target.value)}>
                <option value="">-- Select --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            {renderFields()}
            <div style={{ marginTop: 32, textAlign: 'right' }}>
              <button type="submit" style={{ background: '#ffb300', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: 1 }}>ADD</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default ProductAddAdminModal; 