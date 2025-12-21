import "reflect-metadata";
import { Product } from "../product/product.entity";
import { Category } from "../product/categories/category.entity";

/**
 * Seed categories và products
 * Tận dụng TẤT CẢ data từ products-script.ts
 */
export async function seedCategories(): Promise<Record<string, Category>> {
  console.log("📋 Seeding categories...");
  const categories: Record<string, Category> = {};

  const categoryData = [
    { name: "CPU", slug: "cpu" },
    { name: "GPU", slug: "gpu" },
    { name: "RAM", slug: "ram" },
    { name: "Drive", slug: "drive" },
    { name: "Motherboard", slug: "motherboard" },
    { name: "PSU", slug: "psu" },
    { name: "Case", slug: "case" },
    { name: "Monitor", slug: "monitor" },
    { name: "Mouse", slug: "mouse" },
    { name: "Keyboard", slug: "keyboard" },
    { name: "Headset", slug: "headset" },
    { name: "Network Card", slug: "network-card" },
    { name: "Cooler", slug: "cooler" },
    { name: "Laptop", slug: "laptop" },
    { name: "PC", slug: "pc" },
  ];

  for (const catData of categoryData) {
    // Tìm category theo name trước (ổn định hơn), hoặc slug nếu name không match
    let category = await Category.findOne({ where: { name: catData.name } });
    
    // Nếu không tìm thấy theo name, thử tìm theo slug
    if (!category) {
      category = await Category.findOne({ where: { slug: catData.slug } });
    }
    
    // Nếu vẫn không tìm thấy, thử tìm theo slug được auto-generate (lowercase từ name)
    if (!category) {
      const autoSlug = catData.name.toLowerCase();
      if (autoSlug !== catData.slug) {
        category = await Category.findOne({ where: { slug: autoSlug } });
      }
    }
    
    if (!category) {
      category = new Category();
      category.name = catData.name;
      // Slug sẽ được auto-generate từ name bởi hook @BeforeInsert
      // Nếu muốn dùng slug tùy chỉnh, cần set sau khi name đã được set
      await category.save();
      // Hook sẽ generate slug = name.toLowerCase()
      // Nếu slug thực tế khác với mong muốn, update lại
      if (category.slug !== catData.slug && catData.slug) {
        category.slug = catData.slug;
        await category.save();
      }
      console.log(`✅ Created category: ${catData.name} (${category.slug})`);
    } else {
      console.log(`ℹ️  Category already exists: ${catData.name} (${category.slug})`);
    }
    // Map với slug thực tế và slug mong muốn để dùng trong seedProducts
    categories[category.slug || catData.slug] = category;
    if (category.slug && category.slug !== catData.slug) {
      categories[catData.slug] = category;
    }
  }

  return categories;
}

/**
 * Seed tất cả products từ products-script.ts
 */
export async function seedProducts(categories: Record<string, Category>): Promise<Product[]> {
  console.log("\n📦 Seeding products from products-script.ts...");
  const savedProducts: Product[] = [];

  // ========== CPU Products ==========
  const cpuProducts = [
    { name: "Intel Core i9-13900K", price: 15990000, description: "Intel Core i9-13900K 24-Core Processor with Intel UHD Graphics 770", stock: 15 },
    { name: "AMD Ryzen 9 7950X", price: 18990000, description: "AMD Ryzen 9 7950X 16-Core Processor with AMD Radeon Graphics", stock: 12 },
    { name: "Intel Core i7-13700K", price: 11990000, description: "Intel Core i7-13700K 16-Core Processor with Intel UHD Graphics 770", stock: 20 },
    { name: "AMD Ryzen 5 7600X", price: 7990000, description: "AMD Ryzen 5 7600X 6-Core Processor with AMD Radeon Graphics", stock: 25 },
    { name: "Intel Core i5-13600K", price: 8990000, description: "Intel Core i5-13600K 14-Core Processor with Intel UHD Graphics 770", stock: 30 },
    { name: "AMD Ryzen 7 5800X3D", price: 12990000, description: "AMD Ryzen 7 5800X3D 8-Core Processor with 3D V-Cache", stock: 15 },
    // From addPopularizedSampleProductsFromLaptopMd
    { name: "AMD Ryzen 7 5800X", price: 7990000, description: "AMD Ryzen 7 5800X 8-Core Processor", stock: 10 },
    { name: "Intel Core i5-12400F", price: 4990000, description: "Intel Core i5-12400F 6-Core Processor", stock: 12 },
    { name: "AMD Ryzen 5 5600X", price: 3990000, description: "AMD Ryzen 5 5600X 6-Core Processor", stock: 10 },
  ];

  for (const prodData of cpuProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.cpu;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added CPU: ${prodData.name}`);
    }
  }

  // ========== GPU Products ==========
  const gpuProducts = [
    { name: "NVIDIA GeForce RTX 4090", price: 45990000, description: "NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card", stock: 8 },
    { name: "AMD Radeon RX 7900 XTX", price: 29990000, description: "AMD Radeon RX 7900 XTX 24GB GDDR6 Graphics Card", stock: 10 },
    { name: "NVIDIA GeForce RTX 4080", price: 32990000, description: "NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card", stock: 12 },
    { name: "NVIDIA GeForce RTX 4070 Ti", price: 22990000, description: "NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X Graphics Card", stock: 18 },
    { name: "AMD Radeon RX 7800 XT", price: 22990000, description: "AMD Radeon RX 7800 XT 16GB GDDR6 Graphics Card", stock: 15 },
    { name: "AMD Radeon RX 7700 XT", price: 15990000, description: "AMD Radeon RX 7700 XT 12GB GDDR6 Graphics Card", stock: 22 },
    { name: "NVIDIA GeForce RTX 4060 Ti", price: 15990000, description: "NVIDIA GeForce RTX 4060 Ti 8GB GDDR6 Graphics Card", stock: 25 },
    // From addPopularizedSampleProductsFromLaptopMd
    { name: "AMD Radeon RX 6700 XT", price: 11990000, description: "AMD Radeon RX 6700 XT 12GB GDDR6 Graphics Card", stock: 10 },
  ];

  for (const prodData of gpuProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.gpu;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added GPU: ${prodData.name}`);
    }
  }

  // ========== RAM Products ==========
  const ramProducts = [
    { name: "Corsair Vengeance RGB Pro 32GB", price: 2990000, description: "Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4-3600MHz", stock: 25 },
    { name: "G.Skill Trident Z5 RGB 32GB", price: 3990000, description: "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000MHz", stock: 20 },
    { name: "Kingston Fury Beast 16GB", price: 1590000, description: "Kingston Fury Beast 16GB (2x8GB) DDR4-3200MHz", stock: 30 },
    { name: "Crucial Ballistix MAX 64GB", price: 5990000, description: "Crucial Ballistix MAX 64GB (2x32GB) DDR4-4000MHz", stock: 12 },
    { name: "TeamGroup T-Force Delta RGB 32GB", price: 3490000, description: "TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR4-3600MHz", stock: 20 },
    { name: "Patriot Viper Steel 16GB", price: 1290000, description: "Patriot Viper Steel 16GB (2x8GB) DDR4-3200MHz", stock: 35 },
    // DDR5 RAM products (product100-109)
    { name: "Corsair Dominator Platinum RGB 32GB DDR5-6000", price: 4990000, description: "Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5-6000MHz", stock: 15 },
    { name: "G.Skill Ripjaws S5 32GB DDR5-5600", price: 4290000, description: "G.Skill Ripjaws S5 32GB (2x16GB) DDR5-5600MHz", stock: 18 },
    { name: "Kingston Fury Beast 32GB DDR5-6000", price: 4590000, description: "Kingston Fury Beast 32GB (2x16GB) DDR5-6000MHz", stock: 20 },
    { name: "TeamGroup T-Force Delta RGB 32GB DDR5-6400", price: 5690000, description: "TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5-6400MHz", stock: 12 },
    { name: "Crucial Pro 32GB DDR5-5600", price: 3990000, description: "Crucial Pro 32GB (2x16GB) DDR5-5600MHz", stock: 16 },
    { name: "Patriot Viper Venom 32GB DDR5-6200", price: 4890000, description: "Patriot Viper Venom 32GB (2x16GB) DDR5-6200MHz", stock: 10 },
    { name: "ADATA XPG Lancer RGB 32GB DDR5-6000", price: 4790000, description: "ADATA XPG Lancer RGB 32GB (2x16GB) DDR5-6000MHz", stock: 14 },
    { name: "PNY XLR8 Gaming 32GB DDR5-6000", price: 4690000, description: "PNY XLR8 Gaming 32GB (2x16GB) DDR5-6000MHz", stock: 11 },
    { name: "Samsung 32GB DDR5-4800", price: 3590000, description: "Samsung 32GB (2x16GB) DDR5-4800MHz", stock: 22 },
    { name: "Lexar ARES RGB 32GB DDR5-5600", price: 4190000, description: "Lexar ARES RGB 32GB (2x16GB) DDR5-5600MHz", stock: 13 },
    // From addPopularizedSampleProductsFromLaptopMd
    { name: "Corsair Vengeance 16GB DDR4-3200", price: 1590000, description: "Corsair Vengeance 16GB (2x8GB) DDR4-3200MHz", stock: 20 },
    { name: "TeamGroup T-Force Delta RGB 16GB DDR4-3200", price: 1290000, description: "TeamGroup T-Force Delta RGB 16GB (2x8GB) DDR4-3200MHz", stock: 18 },
    { name: "Crucial Ballistix 32GB DDR4-3600", price: 1990000, description: "Crucial Ballistix 32GB (2x16GB) DDR4-3600MHz", stock: 12 },
  ];

  for (const prodData of ramProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.ram;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added RAM: ${prodData.name}`);
    }
  }

  // ========== Drive Products ==========
  const driveProducts = [
    { name: "Samsung 970 EVO Plus 1TB", price: 2990000, description: "Samsung 970 EVO Plus 1TB NVMe M.2 SSD", stock: 22 },
    { name: "WD Black SN850X 2TB", price: 5990000, description: "WD Black SN850X 2TB NVMe M.2 SSD", stock: 15 },
    { name: "Seagate Barracuda 2TB", price: 1590000, description: "Seagate Barracuda 2TB 7200RPM SATA HDD", stock: 35 },
    { name: "Crucial P5 Plus 1TB", price: 3490000, description: "Crucial P5 Plus 1TB NVMe M.2 SSD", stock: 18 },
    { name: "Sabrent Rocket 4 Plus 2TB", price: 6990000, description: "Sabrent Rocket 4 Plus 2TB NVMe M.2 SSD", stock: 12 },
    { name: "Western Digital Blue 4TB", price: 2990000, description: "Western Digital Blue 4TB 5400RPM SATA HDD", stock: 25 },
    // From addPopularizedSampleProductsFromLaptopMd & addSampleProductsFromLaptopMd
    { name: "Samsung 980 PRO 1TB NVMe SSD", price: 2990000, description: "Samsung 980 PRO 1TB NVMe PCIe Gen4 SSD", stock: 12 },
    { name: "Crucial P5 Plus 2TB", price: 5990000, description: "Crucial P5 Plus 2TB NVMe M.2 SSD", stock: 7 },
  ];

  for (const prodData of driveProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.drive;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Drive: ${prodData.name}`);
    }
  }

  // ========== Motherboard Products ==========
  const motherboardProducts = [
    { name: "ASUS ROG Maximus Z790 Hero", price: 8990000, description: "ASUS ROG Maximus Z790 Hero Intel Z790 ATX Motherboard", stock: 12 },
    { name: "MSI MPG B650 Carbon WiFi", price: 5990000, description: "MSI MPG B650 Carbon WiFi AMD B650 ATX Motherboard", stock: 18 },
    { name: "Gigabyte B760 Aorus Elite", price: 4990000, description: "Gigabyte B760 Aorus Elite Intel B760 ATX Motherboard", stock: 20 },
    { name: "ASRock B650E PG Riptide WiFi", price: 3990000, description: "ASRock B650E PG Riptide WiFi AMD B650E ATX Motherboard", stock: 22 },
    { name: "MSI PRO Z690-A WiFi", price: 5990000, description: "MSI PRO Z690-A WiFi Intel Z690 ATX Motherboard", stock: 16 },
    { name: "ASUS TUF Gaming B760M-Plus WiFi", price: 4490000, description: "ASUS TUF Gaming B760M-Plus WiFi Intel B760 mATX Motherboard", stock: 28 },
    // From addSampleProductsFromLaptopMd
    { name: "ASUS ROG Strix Z690-A", price: 7990000, description: "ASUS ROG Strix Z690-A Gaming WiFi D4 ATX Motherboard", stock: 9 },
  ];

  for (const prodData of motherboardProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.motherboard;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Motherboard: ${prodData.name}`);
    }
  }

  // ========== PSU Products ==========
  const psuProducts = [
    { name: "Corsair RM850x", price: 3990000, description: "Corsair RM850x 850W 80+ Gold Fully Modular PSU", stock: 16 },
    { name: "Seasonic Focus GX-750", price: 2990000, description: "Seasonic Focus GX-750 750W 80+ Gold Fully Modular PSU", stock: 18 },
    { name: "EVGA SuperNOVA 1000W", price: 5990000, description: "EVGA SuperNOVA 1000W 80+ Platinum Fully Modular PSU", stock: 10 },
    { name: "be quiet! Straight Power 11 850W", price: 4990000, description: "be quiet! Straight Power 11 850W 80+ Gold Fully Modular PSU", stock: 14 },
    { name: "Cooler Master V850 Gold V2", price: 3990000, description: "Cooler Master V850 Gold V2 850W 80+ Gold Fully Modular PSU", stock: 18 },
    { name: "Thermaltake Toughpower GF1 750W", price: 2990000, description: "Thermaltake Toughpower GF1 750W 80+ Gold Fully Modular PSU", stock: 20 },
    // From addPopularizedSampleProductsFromLaptopMd & addSampleProductsFromLaptopMd
    { name: "Corsair RM1000x 1000W 80+ Gold", price: 4990000, description: "Corsair RM1000x 1000W 80+ Gold Fully Modular PSU", stock: 6 },
    { name: "EVGA SuperNOVA 850 G5", price: 3990000, description: "EVGA SuperNOVA 850 G5 850W 80+ Gold Fully Modular PSU", stock: 7 },
  ];

  for (const prodData of psuProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.psu;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added PSU: ${prodData.name}`);
    }
  }

  // ========== Case Products ==========
  const caseProducts = [
    { name: "NZXT H510 Elite", price: 3990000, description: "NZXT H510 Elite Mid-Tower ATX Case with Tempered Glass", stock: 14 },
    { name: "Lian Li O11 Dynamic", price: 5990000, description: "Lian Li O11 Dynamic Mid-Tower ATX Case", stock: 12 },
    { name: "Phanteks Enthoo 719", price: 8990000, description: "Phanteks Enthoo 719 Full-Tower ATX Case", stock: 8 },
    { name: "Fractal Design Meshify C", price: 2990000, description: "Fractal Design Meshify C Mid-Tower ATX Case", stock: 16 },
    { name: "be quiet! Pure Base 500DX", price: 3990000, description: "be quiet! Pure Base 500DX Mid-Tower ATX Case", stock: 12 },
    { name: "Corsair 4000D Airflow", price: 3490000, description: "Corsair 4000D Airflow Mid-Tower ATX Case", stock: 18 },
    // From addPopularizedSampleProductsFromLaptopMd
    { name: "Lian Li PC-O11 Dynamic", price: 4990000, description: "Lian Li PC-O11 Dynamic Mid-Tower ATX Case", stock: 8 },
    { name: "NZXT H7 Flow", price: 3990000, description: "NZXT H7 Flow Mid-Tower ATX Case", stock: 8 },
  ];

  for (const prodData of caseProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.case;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Case: ${prodData.name}`);
    }
  }

  // ========== Monitor Products ==========
  const monitorProducts = [
    { name: "Samsung Odyssey G9", price: 19990000, description: "Samsung Odyssey G9 49-inch Ultrawide Gaming Monitor", stock: 6 },
    { name: "LG 27GP850-B", price: 8990000, description: "LG 27GP850-B 27-inch 1440p 165Hz Gaming Monitor", stock: 15 },
    { name: "ASUS ROG Swift PG279Q", price: 12990000, description: "ASUS ROG Swift PG279Q 27-inch 1440p 165Hz Gaming Monitor", stock: 10 },
    { name: "AOC CU34G2X", price: 8990000, description: "AOC CU34G2X 34-inch Ultrawide Gaming Monitor", stock: 10 },
    { name: "MSI Optix MAG274QRF", price: 7990000, description: "MSI Optix MAG274QRF 27-inch 1440p 165Hz Gaming Monitor", stock: 12 },
    { name: "ViewSonic XG270QG", price: 9990000, description: "ViewSonic XG270QG 27-inch 1440p 165Hz Gaming Monitor", stock: 8 },
    // From addPopularizedSampleProductsFromLaptopMd & addSampleProductsFromLaptopMd
    { name: "Samsung Odyssey G7", price: 15990000, description: "Samsung Odyssey G7 32-inch 240Hz QHD Gaming Monitor", stock: 6 },
    { name: "LG UltraGear 27GP850-B", price: 8990000, description: "LG UltraGear 27GP850-B 27-inch 1440p 165Hz Gaming Monitor", stock: 7 },
  ];

  for (const prodData of monitorProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.monitor;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Monitor: ${prodData.name}`);
    }
  }

  // ========== Mouse Products ==========
  const mouseProducts = [
    { name: "Logitech G Pro X Superlight", price: 2990000, description: "Logitech G Pro X Superlight Wireless Gaming Mouse", stock: 25 },
    { name: "Razer DeathAdder V3 Pro", price: 3990000, description: "Razer DeathAdder V3 Pro Wireless Gaming Mouse", stock: 20 },
    { name: "SteelSeries Rival 600", price: 1990000, description: "SteelSeries Rival 600 Gaming Mouse", stock: 18 },
    { name: "Glorious Model O Wireless", price: 2490000, description: "Glorious Model O Wireless Gaming Mouse", stock: 22 },
    { name: "Pulsar Xlite V2", price: 1990000, description: "Pulsar Xlite V2 Wireless Gaming Mouse", stock: 18 },
    { name: "Endgame Gear XM1r", price: 1790000, description: "Endgame Gear XM1r Gaming Mouse", stock: 15 },
  ];

  for (const prodData of mouseProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.mouse;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Mouse: ${prodData.name}`);
    }
  }

  // ========== Keyboard Products ==========
  const keyboardProducts = [
    { name: "Corsair K100 RGB", price: 5990000, description: "Corsair K100 RGB Mechanical Gaming Keyboard", stock: 12 },
    { name: "Razer BlackWidow V3 Pro", price: 4990000, description: "Razer BlackWidow V3 Pro Wireless Mechanical Keyboard", stock: 15 },
    { name: "SteelSeries Apex Pro", price: 6990000, description: "SteelSeries Apex Pro TKL Wireless Mechanical Keyboard", stock: 10 },
    { name: "Ducky One 3 RGB", price: 3990000, description: "Ducky One 3 RGB Mechanical Gaming Keyboard", stock: 16 },
    { name: "Varmilo VA87M", price: 3490000, description: "Varmilo VA87M Mechanical Gaming Keyboard", stock: 12 },
    { name: "Leopold FC900R", price: 2990000, description: "Leopold FC900R Mechanical Gaming Keyboard", stock: 14 },
  ];

  for (const prodData of keyboardProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.keyboard;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Keyboard: ${prodData.name}`);
    }
  }

  // ========== Headset Products ==========
  const headsetProducts = [
    { name: "SteelSeries Arctis Pro Wireless", price: 5990000, description: "SteelSeries Arctis Pro Wireless Gaming Headset", stock: 14 },
    { name: "HyperX Cloud Alpha", price: 2990000, description: "HyperX Cloud Alpha Gaming Headset", stock: 22 },
    { name: "Logitech G Pro X", price: 3990000, description: "Logitech G Pro X Wireless Gaming Headset", stock: 16 },
    { name: "Beyerdynamic DT 990 Pro", price: 3990000, description: "Beyerdynamic DT 990 Pro Gaming Headset", stock: 18 },
    { name: "Audio-Technica ATH-M50x", price: 3490000, description: "Audio-Technica ATH-M50x Gaming Headset", stock: 20 },
    { name: "Sennheiser HD 560S", price: 4490000, description: "Sennheiser HD 560S Gaming Headset", stock: 12 },
  ];

  for (const prodData of headsetProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.headset;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Headset: ${prodData.name}`);
    }
  }

  // ========== Network Card Products ==========
  const networkCardProducts = [
    { name: "Intel AX200 WiFi 6", price: 899000, description: "Intel AX200 WiFi 6 Wireless Network Adapter", stock: 30 },
    { name: "ASUS PCE-AC88", price: 1990000, description: "ASUS PCE-AC88 AC3100 Wireless Network Adapter", stock: 18 },
    { name: "TP-Link Archer T9E", price: 1590000, description: "TP-Link Archer T9E AC1900 Wireless Network Adapter", stock: 20 },
    { name: "ASUS PCE-AX58BT", price: 2490000, description: "ASUS PCE-AX58BT WiFi 6 Wireless Network Adapter", stock: 16 },
    { name: "Gigabyte GC-WBAX200", price: 1990000, description: "Gigabyte GC-WBAX200 WiFi 6 Wireless Network Adapter", stock: 18 },
    { name: "MSI AX1800", price: 1790000, description: "MSI AX1800 WiFi 6 Wireless Network Adapter", stock: 14 },
  ];

  for (const prodData of networkCardProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories["network-card"];
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Network Card: ${prodData.name}`);
    }
  }

  // ========== Cooler Products ==========
  const coolerProducts = [
    { name: "Noctua NH-D15", price: 2490000, description: "Noctua NH-D15 Premium CPU Air Cooler", stock: 8 },
    { name: "Noctua NH-U12S", price: 1890000, description: "Noctua NH-U12S Premium CPU Air Cooler", stock: 8 },
    { name: "be quiet! Dark Rock Pro 4", price: 2490000, description: "be quiet! Dark Rock Pro 4 Premium CPU Air Cooler", stock: 7 },
  ];

  for (const prodData of coolerProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.cooler;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Cooler: ${prodData.name}`);
    }
  }

  // ========== Laptop Products ==========
  const laptopProducts = [
    // Gaming Laptops
    { name: "ASUS ROG Strix G15 G513", price: 25990000, description: "ASUS ROG Strix G15 Gaming Laptop with AMD Ryzen 7 and RTX 3070", stock: 8 },
    { name: "MSI GE76 Raider", price: 45990000, description: "MSI GE76 Raider Gaming Laptop with Intel Core i9 and RTX 4080", stock: 5 },
    { name: "Acer Predator Helios 300", price: 29990000, description: "Acer Predator Helios 300 Gaming Laptop with Intel Core i7 and RTX 3060", stock: 10 },
    { name: "Alienware x17 R2", price: 65990000, description: "Alienware x17 R2 Gaming Laptop with Intel Core i9 and RTX 4090", stock: 3 },
    { name: "Razer Blade 15", price: 52990000, description: "Razer Blade 15 Gaming Laptop with Intel Core i7 and RTX 4070", stock: 6 },
    // Business/Productivity Laptops
    { name: "ThinkPad X1 Carbon Gen 11", price: 35990000, description: "Lenovo ThinkPad X1 Carbon Business Laptop with Intel Core i7", stock: 12 },
    { name: "MacBook Pro 16-inch M3", price: 59990000, description: "Apple MacBook Pro 16-inch with M3 Pro chip", stock: 8 },
    { name: "Dell XPS 13 Plus", price: 32990000, description: "Dell XPS 13 Plus Ultrabook with Intel Core i7", stock: 15 },
    { name: "HP Spectre x360", price: 28990000, description: "HP Spectre x360 2-in-1 Laptop with Intel Core i7", stock: 10 },
    { name: "ASUS ZenBook Pro 15", price: 38990000, description: "ASUS ZenBook Pro 15 Creative Laptop with Intel Core i9", stock: 7 },
    // From addSampleProductsFromLaptopMd
    { name: "ASUS ROG Zephyrus G14", price: 34990000, description: "ASUS ROG Zephyrus G14 Gaming Laptop with AMD Ryzen 9 and RTX 4060", stock: 5 },
    // From addPopularizedSampleProductsFromLaptopMd
    { name: "HP Spectre x360 14", price: 28990000, description: "HP Spectre x360 14 2-in-1 Laptop with Intel Core i7", stock: 7 },
  ];

  for (const prodData of laptopProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.laptop;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added Laptop: ${prodData.name}`);
    }
  }

  // ========== PC Products ==========
  const pcProducts = [
    // Gaming PCs
    { name: "NZXT BLD Gaming PC - RTX 4090", price: 85990000, description: "High-end Gaming PC with Intel Core i9-13900K and RTX 4090", stock: 3 },
    { name: "Origin Chronos Gaming PC", price: 65990000, description: "Gaming PC with AMD Ryzen 9 7900X and RTX 4080", stock: 5 },
    { name: "Corsair ONE i300 Gaming PC", price: 75990000, description: "Compact Gaming PC with Intel Core i9 and RTX 4070 Ti", stock: 4 },
    { name: "Alienware Aurora R15", price: 55990000, description: "Alienware Aurora Gaming Desktop with Intel Core i7 and RTX 4070", stock: 6 },
    { name: "MSI Aegis RS 13", price: 45990000, description: "MSI Gaming Desktop with Intel Core i7 and RTX 4060 Ti", stock: 8 },
    // Workstation PCs
    { name: "HP Z6 G5 Workstation", price: 95990000, description: "Professional Workstation with Intel Xeon and RTX A6000", stock: 2 },
    { name: "Dell Precision 7000", price: 78990000, description: "Dell Precision Workstation with Intel Core i9 and RTX A5000", stock: 3 },
    // Budget PCs
    { name: "HP Pavilion Desktop", price: 18990000, description: "Budget Desktop PC with AMD Ryzen 5 and GTX 1660", stock: 15 },
    { name: "ASUS VivoPC Mini", price: 12990000, description: "Compact Mini PC with Intel Core i5 for Office Work", stock: 20 },
    { name: "Acer Aspire TC Desktop", price: 15990000, description: "Entry-level Desktop PC with AMD Ryzen 3 and integrated graphics", stock: 18 },
  ];

  for (const prodData of pcProducts) {
    let product = await Product.findOne({ where: { name: prodData.name } });
    if (!product) {
      product = new Product();
      Object.assign(product, prodData);
      product.category = categories.pc;
      product.isActive = true;
      await product.save();
      savedProducts.push(product);
      console.log(`✅ Added PC: ${prodData.name}`);
    }
  }

  console.log(`\n✅ Products seeded successfully: ${savedProducts.length} new products`);
  return savedProducts;
}

/**
 * Main function để seed categories và products
 */
export async function seedAllProducts(): Promise<void> {
  console.log("🌱 Starting product seeding process...\n");

  try {
    const categories = await seedCategories();
    await seedProducts(categories);

    console.log("\n🎉 Product seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during product seeding:", error);
    throw error;
  }
}