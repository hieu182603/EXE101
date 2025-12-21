import { Product } from "./product.entity";
import { Category } from "./categories/category.entity";
import { CPU } from "./components/cpu.entity";
import { GPU } from "./components/gpu.entity";
import { RAM } from "./components/ram.entity";
import { Drive } from "./components/drive.entity";
import { Motherboard } from "./components/motherboard.entity";
import { PSU } from "./components/psu.entity";
import { Case } from "./components/case.entity";
import { Monitor } from "./components/monitor.entity";
import { Mouse } from "./components/mouse.entity";
import { Keyboard } from "./components/keyboard.entity";
import { Headset } from "./components/headset.entity";
import { NetworkCard } from "./components/networkCard.entity";
import { Laptop } from "./components/laptop/laptop.entity";
import { PC } from "./components/pc.entity";
import { Cooler } from "./components/cooler.entity";

// async addProducts() {
//     const caseCategory = await Category.findOne({
//       where: { slug: "case" },
//     });
//     if (!caseCategory) {
//       throw new Error("Case category not found");
//     }
//     const cpuCategory = await Category.findOne({
//       where: { slug: "cpu" },
//     });
//     if (!cpuCategory) {
//       throw new Error("CPU category not found");
//     }
//     const gpuCategory = await Category.findOne({
//       where: { slug: "gpu" },
//     });
//     if (!gpuCategory) {
//       throw new Error("GPU category not found");
//     }
//     const motherboardCategory = await Category.findOne({
//       where: { slug: "motherboard" },
//     });
//     if (!motherboardCategory) {
//       throw new Error("Motherboard category not found");
//     }
//     const psuCategory = await Category.findOne({
//       where: { slug: "psu" },
//     });
//     if (!psuCategory) {
//       throw new Error("PSU category not found");
//     }
//     const ramCategory = await Category.findOne({
//       where: { slug: "ram" },
//     });
//     if (!ramCategory) {
//       throw new Error("RAM category not found");
//     }
//     const driveCategory = await Category.findOne({
//       where: { slug: "drive" },
//     });
//     if (!driveCategory) {
//       throw new Error("Drive category not found");
//     }
//     const monitorCategory = await Category.findOne({
//       where: { slug: "monitor" },
//     });
//     if (!monitorCategory) {
//       throw new Error("Monitor category not found");
//     }
//     const mouseCategory = await Category.findOne({
//       where: { slug: "mouse" },
//     });
//     if (!mouseCategory) {
//       throw new Error("Mouse category not found");
//     }
//     const networkCardCategory = await Category.findOne({
//       where: { slug: "network-card" },
//     });
//     if (!networkCardCategory) {
//       throw new Error("Network card category not found");
//     }
//     const headsetCategory = await Category.findOne({
//       where: { slug: "headset" },
//     });
//     if (!headsetCategory) {
//       throw new Error("Headset category not found");
//     }
//     const keyboardCategory = await Category.findOne({
//       where: { slug: "keyboard" },
//     });
//     if (!keyboardCategory) {
//       throw new Error("Keyboard category not found");
//     }

//     // Create products using Active Records
//     const savedProducts = [];

//     // CPU Products
//     const product1: Product = new Product();
//     product1.name = "Intel Core i9-13900K";
//     product1.price = 15990000;
//     product1.description =
//       "Intel Core i9-13900K 24-Core Processor with Intel UHD Graphics 770";
//     product1.stock = 15;
//     product1.category = cpuCategory;
//     await product1.save();
//     savedProducts.push(product1);
//     console.log(`Added product: ${product1.name}`);

//     const product2: Product = new Product();
//     product2.name = "AMD Ryzen 9 7950X";
//     product2.price = 18990000;
//     product2.description =
//       "AMD Ryzen 9 7950X 16-Core Processor with AMD Radeon Graphics";
//     product2.stock = 12;
//     product2.category = cpuCategory;
//     await product2.save();
//     savedProducts.push(product2);
//     console.log(`Added product: ${product2.name}`);

//     const product3: Product = new Product();
//     product3.name = "Intel Core i7-13700K";
//     product3.price = 11990000;
//     product3.description =
//       "Intel Core i7-13700K 16-Core Processor with Intel UHD Graphics 770";
//     product3.stock = 20;
//     product3.category = cpuCategory;
//     await product3.save();
//     savedProducts.push(product3);
//     console.log(`Added product: ${product3.name}`);

//     // GPU Products
//     const product4: Product = new Product();
//     product4.name = "NVIDIA GeForce RTX 4090";
//     product4.price = 45990000;
//     product4.description = "NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card";
//     product4.stock = 8;
//     product4.category = gpuCategory;
//     await product4.save();
//     savedProducts.push(product4);
//     console.log(`Added product: ${product4.name}`);

//     const product5: Product = new Product();
//     product5.name = "AMD Radeon RX 7900 XTX";
//     product5.price = 29990000;
//     product5.description = "AMD Radeon RX 7900 XTX 24GB GDDR6 Graphics Card";
//     product5.stock = 10;
//     product5.category = gpuCategory;
//     await product5.save();
//     savedProducts.push(product5);
//     console.log(`Added product: ${product5.name}`);

//     const product6: Product = new Product();
//     product6.name = "NVIDIA GeForce RTX 4080";
//     product6.price = 32990000;
//     product6.description = "NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card";
//     product6.stock = 12;
//     product6.category = gpuCategory;
//     await product6.save();
//     savedProducts.push(product6);
//     console.log(`Added product: ${product6.name}`);

//     // RAM Products
//     const product7: Product = new Product();
//     product7.name = "Corsair Vengeance RGB Pro 32GB";
//     product7.price = 2990000;
//     product7.description =
//       "Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4-3600MHz";
//     product7.stock = 25;
//     product7.category = ramCategory;
//     await product7.save();
//     savedProducts.push(product7);
//     console.log(`Added product: ${product7.name}`);

//     const product8: Product = new Product();
//     product8.name = "G.Skill Trident Z5 RGB 32GB";
//     product8.price = 3990000;
//     product8.description = "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000MHz";
//     product8.stock = 20;
//     product8.category = ramCategory;
//     await product8.save();
//     savedProducts.push(product8);
//     console.log(`Added product: ${product8.name}`);

//     const product9: Product = new Product();
//     product9.name = "Kingston Fury Beast 16GB";
//     product9.price = 1590000;
//     product9.description = "Kingston Fury Beast 16GB (2x8GB) DDR4-3200MHz";
//     product9.stock = 30;
//     product9.category = ramCategory;
//     await product9.save();
//     savedProducts.push(product9);
//     console.log(`Added product: ${product9.name}`);

//     // Drive Products
//     const product10: Product = new Product();
//     product10.name = "Samsung 970 EVO Plus 1TB";
//     product10.price = 2990000;
//     product10.description = "Samsung 970 EVO Plus 1TB NVMe M.2 SSD";
//     product10.stock = 22;
//     product10.category = driveCategory;
//     await product10.save();
//     savedProducts.push(product10);
//     console.log(`Added product: ${product10.name}`);

//     const product11: Product = new Product();
//     product11.name = "WD Black SN850X 2TB";
//     product11.price = 5990000;
//     product11.description = "WD Black SN850X 2TB NVMe M.2 SSD";
//     product11.stock = 15;
//     product11.category = driveCategory;
//     await product11.save();
//     savedProducts.push(product11);
//     console.log(`Added product: ${product11.name}`);

//     const product12: Product = new Product();
//     product12.name = "Seagate Barracuda 2TB";
//     product12.price = 1590000;
//     product12.description = "Seagate Barracuda 2TB 7200RPM SATA HDD";
//     product12.stock = 35;
//     product12.category = driveCategory;
//     await product12.save();
//     savedProducts.push(product12);
//     console.log(`Added product: ${product12.name}`);

//     // Motherboard Products
//     const product13: Product = new Product();
//     product13.name = "ASUS ROG Maximus Z790 Hero";
//     product13.price = 8990000;
//     product13.description =
//       "ASUS ROG Maximus Z790 Hero Intel Z790 ATX Motherboard";
//     product13.stock = 12;
//     product13.category = motherboardCategory;
//     await product13.save();
//     savedProducts.push(product13);
//     console.log(`Added product: ${product13.name}`);

//     const product14: Product = new Product();
//     product14.name = "MSI MPG B650 Carbon WiFi";
//     product14.price = 5990000;
//     product14.description = "MSI MPG B650 Carbon WiFi AMD B650 ATX Motherboard";
//     product14.stock = 18;
//     product14.category = motherboardCategory;
//     await product14.save();
//     savedProducts.push(product14);
//     console.log(`Added product: ${product14.name}`);

//     const product15: Product = new Product();
//     product15.name = "Gigabyte B760 Aorus Elite";
//     product15.price = 4990000;
//     product15.description =
//       "Gigabyte B760 Aorus Elite Intel B760 ATX Motherboard";
//     product15.stock = 20;
//     product15.category = motherboardCategory;
//     await product15.save();
//     savedProducts.push(product15);
//     console.log(`Added product: ${product15.name}`);

//     // PSU Products
//     const product16: Product = new Product();
//     product16.name = "Corsair RM850x";
//     product16.price = 3990000;
//     product16.description = "Corsair RM850x 850W 80+ Gold Fully Modular PSU";
//     product16.stock = 16;
//     product16.category = psuCategory;
//     await product16.save();
//     savedProducts.push(product16);
//     console.log(`Added product: ${product16.name}`);

//     const product17: Product = new Product();
//     product17.name = "Seasonic Focus GX-750";
//     product17.price = 2990000;
//     product17.description =
//       "Seasonic Focus GX-750 750W 80+ Gold Fully Modular PSU";
//     product17.stock = 18;
//     product17.category = psuCategory;
//     await product17.save();
//     savedProducts.push(product17);
//     console.log(`Added product: ${product17.name}`);

//     const product18: Product = new Product();
//     product18.name = "EVGA SuperNOVA 1000W";
//     product18.price = 5990000;
//     product18.description =
//       "EVGA SuperNOVA 1000W 80+ Platinum Fully Modular PSU";
//     product18.stock = 10;
//     product18.category = psuCategory;
//     await product18.save();
//     savedProducts.push(product18);
//     console.log(`Added product: ${product18.name}`);

//     // Case Products
//     const product19: Product = new Product();
//     product19.name = "NZXT H510 Elite";
//     product19.price = 3990000;
//     product19.description =
//       "NZXT H510 Elite Mid-Tower ATX Case with Tempered Glass";
//     product19.stock = 14;
//     product19.category = caseCategory;
//     await product19.save();
//     savedProducts.push(product19);
//     console.log(`Added product: ${product19.name}`);

//     const product20: Product = new Product();
//     product20.name = "Lian Li O11 Dynamic";
//     product20.price = 5990000;
//     product20.description = "Lian Li O11 Dynamic Mid-Tower ATX Case";
//     product20.stock = 12;
//     product20.category = caseCategory;
//     await product20.save();
//     savedProducts.push(product20);
//     console.log(`Added product: ${product20.name}`);

//     const product21: Product = new Product();
//     product21.name = "Phanteks Enthoo 719";
//     product21.price = 8990000;
//     product21.description = "Phanteks Enthoo 719 Full-Tower ATX Case";
//     product21.stock = 8;
//     product21.category = caseCategory;
//     await product21.save();
//     savedProducts.push(product21);
//     console.log(`Added product: ${product21.name}`);

//     // Monitor Products
//     const product22: Product = new Product();
//     product22.name = "Samsung Odyssey G9";
//     product22.price = 19990000;
//     product22.description =
//       "Samsung Odyssey G9 49-inch Ultrawide Gaming Monitor";
//     product22.stock = 6;
//     product22.category = monitorCategory;
//     await product22.save();
//     savedProducts.push(product22);
//     console.log(`Added product: ${product22.name}`);

//     const product23: Product = new Product();
//     product23.name = "LG 27GP850-B";
//     product23.price = 8990000;
//     product23.description = "LG 27GP850-B 27-inch 1440p 165Hz Gaming Monitor";
//     product23.stock = 15;
//     product23.category = monitorCategory;
//     await product23.save();
//     savedProducts.push(product23);
//     console.log(`Added product: ${product23.name}`);

//     const product24: Product = new Product();
//     product24.name = "ASUS ROG Swift PG279Q";
//     product24.price = 12990000;
//     product24.description =
//       "ASUS ROG Swift PG279Q 27-inch 1440p 165Hz Gaming Monitor";
//     product24.stock = 10;
//     product24.category = monitorCategory;
//     await product24.save();
//     savedProducts.push(product24);
//     console.log(`Added product: ${product24.name}`);

//     // Mouse Products
//     const product25: Product = new Product();
//     product25.name = "Logitech G Pro X Superlight";
//     product25.price = 2990000;
//     product25.description = "Logitech G Pro X Superlight Wireless Gaming Mouse";
//     product25.stock = 25;
//     product25.category = mouseCategory;
//     await product25.save();
//     savedProducts.push(product25);
//     console.log(`Added product: ${product25.name}`);

//     const product26: Product = new Product();
//     product26.name = "Razer DeathAdder V3 Pro";
//     product26.price = 3990000;
//     product26.description = "Razer DeathAdder V3 Pro Wireless Gaming Mouse";
//     product26.stock = 20;
//     product26.category = mouseCategory;
//     await product26.save();
//     savedProducts.push(product26);
//     console.log(`Added product: ${product26.name}`);

//     const product27: Product = new Product();
//     product27.name = "SteelSeries Rival 600";
//     product27.price = 1990000;
//     product27.description = "SteelSeries Rival 600 Gaming Mouse";
//     product27.stock = 18;
//     product27.category = mouseCategory;
//     await product27.save();
//     savedProducts.push(product27);
//     console.log(`Added product: ${product27.name}`);

//     // Keyboard Products
//     const product28: Product = new Product();
//     product28.name = "Corsair K100 RGB";
//     product28.price = 5990000;
//     product28.description = "Corsair K100 RGB Mechanical Gaming Keyboard";
//     product28.stock = 12;
//     product28.category = keyboardCategory;
//     await product28.save();
//     savedProducts.push(product28);
//     console.log(`Added product: ${product28.name}`);

//     const product29: Product = new Product();
//     product29.name = "Razer BlackWidow V3 Pro";
//     product29.price = 4990000;
//     product29.description =
//       "Razer BlackWidow V3 Pro Wireless Mechanical Keyboard";
//     product29.stock = 15;
//     product29.category = keyboardCategory;
//     await product29.save();
//     savedProducts.push(product29);
//     console.log(`Added product: ${product29.name}`);

//     const product30: Product = new Product();
//     product30.name = "SteelSeries Apex Pro";
//     product30.price = 6990000;
//     product30.description =
//       "SteelSeries Apex Pro TKL Wireless Mechanical Keyboard";
//     product30.stock = 10;
//     product30.category = keyboardCategory;
//     await product30.save();
//     savedProducts.push(product30);
//     console.log(`Added product: ${product30.name}`);

//     // Headset Products
//     const product31: Product = new Product();
//     product31.name = "SteelSeries Arctis Pro Wireless";
//     product31.price = 5990000;
//     product31.description = "SteelSeries Arctis Pro Wireless Gaming Headset";
//     product31.stock = 14;
//     product31.category = headsetCategory;
//     await product31.save();
//     savedProducts.push(product31);
//     console.log(`Added product: ${product31.name}`);

//     const product32: Product = new Product();
//     product32.name = "HyperX Cloud Alpha";
//     product32.price = 2990000;
//     product32.description = "HyperX Cloud Alpha Gaming Headset";
//     product32.stock = 22;
//     product32.category = headsetCategory;
//     await product32.save();
//     savedProducts.push(product32);
//     console.log(`Added product: ${product32.name}`);

//     const product33: Product = new Product();
//     product33.name = "Logitech G Pro X";
//     product33.price = 3990000;
//     product33.description = "Logitech G Pro X Wireless Gaming Headset";
//     product33.stock = 16;
//     product33.category = headsetCategory;
//     await product33.save();
//     savedProducts.push(product33);
//     console.log(`Added product: ${product33.name}`);

//     // Network Card Products
//     const product34: Product = new Product();
//     product34.name = "Intel AX200 WiFi 6";
//     product34.price = 899000;
//     product34.description = "Intel AX200 WiFi 6 Wireless Network Adapter";
//     product34.stock = 30;
//     product34.category = networkCardCategory;
//     await product34.save();
//     savedProducts.push(product34);
//     console.log(`Added product: ${product34.name}`);

//     const product35: Product = new Product();
//     product35.name = "ASUS PCE-AC88";
//     product35.price = 1990000;
//     product35.description = "ASUS PCE-AC88 AC3100 Wireless Network Adapter";
//     product35.stock = 18;
//     product35.category = networkCardCategory;
//     await product35.save();
//     savedProducts.push(product35);
//     console.log(`Added product: ${product35.name}`);

//     const product36: Product = new Product();
//     product36.name = "TP-Link Archer T9E";
//     product36.price = 1590000;
//     product36.description =
//       "TP-Link Archer T9E AC1900 Wireless Network Adapter";
//     product36.stock = 20;
//     product36.category = networkCardCategory;
//     await product36.save();
//     savedProducts.push(product36);
//     console.log(`Added product: ${product36.name}`);

//     // Additional CPU Products
//     const product37: Product = new Product();
//     product37.name = "AMD Ryzen 5 7600X";
//     product37.price = 7990000;
//     product37.description =
//       "AMD Ryzen 5 7600X 6-Core Processor with AMD Radeon Graphics";
//     product37.stock = 25;
//     product37.category = cpuCategory;
//     await product37.save();
//     savedProducts.push(product37);
//     console.log(`Added product: ${product37.name}`);

//     const product38: Product = new Product();
//     product38.name = "Intel Core i5-13600K";
//     product38.price = 8990000;
//     product38.description =
//       "Intel Core i5-13600K 14-Core Processor with Intel UHD Graphics 770";
//     product38.stock = 30;
//     product38.category = cpuCategory;
//     await product38.save();
//     savedProducts.push(product38);
//     console.log(`Added product: ${product38.name}`);

//     const product39: Product = new Product();
//     product39.name = "AMD Ryzen 7 5800X3D";
//     product39.price = 12990000;
//     product39.description =
//       "AMD Ryzen 7 5800X3D 8-Core Processor with 3D V-Cache";
//     product39.stock = 15;
//     product39.category = cpuCategory;
//     await product39.save();
//     savedProducts.push(product39);
//     console.log(`Added product: ${product39.name}`);

//     // Additional GPU Products
//     const product40: Product = new Product();
//     product40.name = "NVIDIA GeForce RTX 4070 Ti";
//     product40.price = 22990000;
//     product40.description =
//       "NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X Graphics Card";
//     product40.stock = 18;
//     product40.category = gpuCategory;
//     await product40.save();
//     savedProducts.push(product40);
//     console.log(`Added product: ${product40.name}`);

//     const product41: Product = new Product();
//     product41.name = "AMD Radeon RX 7700 XT";
//     product41.price = 15990000;
//     product41.description = "AMD Radeon RX 7700 XT 12GB GDDR6 Graphics Card";
//     product41.stock = 22;
//     product41.category = gpuCategory;
//     await product41.save();
//     savedProducts.push(product41);
//     console.log(`Added product: ${product41.name}`);

//     const product42: Product = new Product();
//     product42.name = "NVIDIA GeForce RTX 4060 Ti";
//     product42.price = 15990000;
//     product42.description =
//       "NVIDIA GeForce RTX 4060 Ti 8GB GDDR6 Graphics Card";
//     product42.stock = 25;
//     product42.category = gpuCategory;
//     await product42.save();
//     savedProducts.push(product42);
//     console.log(`Added product: ${product42.name}`);

//     // Additional RAM Products
//     const product43: Product = new Product();
//     product43.name = "Crucial Ballistix MAX 64GB";
//     product43.price = 5990000;
//     product43.description = "Crucial Ballistix MAX 64GB (2x32GB) DDR4-4000MHz";
//     product43.stock = 12;
//     product43.category = ramCategory;
//     await product43.save();
//     savedProducts.push(product43);
//     console.log(`Added product: ${product43.name}`);

//     const product44: Product = new Product();
//     product44.name = "TeamGroup T-Force Delta RGB 32GB";
//     product44.price = 3490000;
//     product44.description =
//       "TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR4-3600MHz";
//     product44.stock = 20;
//     product44.category = ramCategory;
//     await product44.save();
//     savedProducts.push(product44);
//     console.log(`Added product: ${product44.name}`);

//     const product45: Product = new Product();
//     product45.name = "Patriot Viper Steel 16GB";
//     product45.price = 1290000;
//     product45.description = "Patriot Viper Steel 16GB (2x8GB) DDR4-3200MHz";
//     product45.stock = 35;
//     product45.category = ramCategory;
//     await product45.save();
//     savedProducts.push(product45);
//     console.log(`Added product: ${product45.name}`);

//     // Additional Drive Products
//     const product46: Product = new Product();
//     product46.name = "Crucial P5 Plus 1TB";
//     product46.price = 3490000;
//     product46.description = "Crucial P5 Plus 1TB NVMe M.2 SSD";
//     product46.stock = 18;
//     product46.category = driveCategory;
//     await product46.save();
//     savedProducts.push(product46);
//     console.log(`Added product: ${product46.name}`);

//     const product47: Product = new Product();
//     product47.name = "Sabrent Rocket 4 Plus 2TB";
//     product47.price = 6990000;
//     product47.description = "Sabrent Rocket 4 Plus 2TB NVMe M.2 SSD";
//     product47.stock = 12;
//     product47.category = driveCategory;
//     await product47.save();
//     savedProducts.push(product47);
//     console.log(`Added product: ${product47.name}`);

//     const product48: Product = new Product();
//     product48.name = "Western Digital Blue 4TB";
//     product48.price = 2990000;
//     product48.description = "Western Digital Blue 4TB 5400RPM SATA HDD";
//     product48.stock = 25;
//     product48.category = driveCategory;
//     await product48.save();
//     savedProducts.push(product48);
//     console.log(`Added product: ${product48.name}`);

//     // Additional Motherboard Products
//     const product49: Product = new Product();
//     product49.name = "ASRock B650E PG Riptide WiFi";
//     product49.price = 3990000;
//     product49.description =
//       "ASRock B650E PG Riptide WiFi AMD B650E ATX Motherboard";
//     product49.stock = 22;
//     product49.category = motherboardCategory;
//     await product49.save();
//     savedProducts.push(product49);
//     console.log(`Added product: ${product49.name}`);

//     const product50: Product = new Product();
//     product50.name = "MSI PRO Z690-A WiFi";
//     product50.price = 5990000;
//     product50.description = "MSI PRO Z690-A WiFi Intel Z690 ATX Motherboard";
//     product50.stock = 16;
//     product50.category = motherboardCategory;
//     await product50.save();
//     savedProducts.push(product50);
//     console.log(`Added product: ${product50.name}`);

//     const product51: Product = new Product();
//     product51.name = "ASUS TUF Gaming B760M-Plus WiFi";
//     product51.price = 4490000;
//     product51.description =
//       "ASUS TUF Gaming B760M-Plus WiFi Intel B760 mATX Motherboard";
//     product51.stock = 28;
//     product51.category = motherboardCategory;
//     await product51.save();
//     savedProducts.push(product51);
//     console.log(`Added product: ${product51.name}`);

//     // Additional PSU Products
//     const product52: Product = new Product();
//     product52.name = "be quiet! Straight Power 11 850W";
//     product52.price = 4990000;
//     product52.description =
//       "be quiet! Straight Power 11 850W 80+ Gold Fully Modular PSU";
//     product52.stock = 14;
//     product52.category = psuCategory;
//     await product52.save();
//     savedProducts.push(product52);
//     console.log(`Added product: ${product52.name}`);

//     const product53: Product = new Product();
//     product53.name = "Cooler Master V850 Gold V2";
//     product53.price = 3990000;
//     product53.description =
//       "Cooler Master V850 Gold V2 850W 80+ Gold Fully Modular PSU";
//     product53.stock = 18;
//     product53.category = psuCategory;
//     await product53.save();
//     savedProducts.push(product53);
//     console.log(`Added product: ${product53.name}`);

//     const product54: Product = new Product();
//     product54.name = "Thermaltake Toughpower GF1 750W";
//     product54.price = 2990000;
//     product54.description =
//       "Thermaltake Toughpower GF1 750W 80+ Gold Fully Modular PSU";
//     product54.stock = 20;
//     product54.category = psuCategory;
//     await product54.save();
//     savedProducts.push(product54);
//     console.log(`Added product: ${product54.name}`);

//     // Additional Case Products
//     const product55: Product = new Product();
//     product55.name = "Fractal Design Meshify C";
//     product55.price = 2990000;
//     product55.description = "Fractal Design Meshify C Mid-Tower ATX Case";
//     product55.stock = 16;
//     product55.category = caseCategory;
//     await product55.save();
//     savedProducts.push(product55);
//     console.log(`Added product: ${product55.name}`);

//     const product56: Product = new Product();
//     product56.name = "be quiet! Pure Base 500DX";
//     product56.price = 3990000;
//     product56.description = "be quiet! Pure Base 500DX Mid-Tower ATX Case";
//     product56.stock = 12;
//     product56.category = caseCategory;
//     await product56.save();
//     savedProducts.push(product56);
//     console.log(`Added product: ${product56.name}`);

//     const product57: Product = new Product();
//     product57.name = "Corsair 4000D Airflow";
//     product57.price = 3490000;
//     product57.description = "Corsair 4000D Airflow Mid-Tower ATX Case";
//     product57.stock = 18;
//     product57.category = caseCategory;
//     await product57.save();
//     savedProducts.push(product57);
//     console.log(`Added product: ${product57.name}`);

//     // Additional Monitor Products
//     const product58: Product = new Product();
//     product58.name = "AOC CU34G2X";
//     product58.price = 8990000;
//     product58.description = "AOC CU34G2X 34-inch Ultrawide Gaming Monitor";
//     product58.stock = 10;
//     product58.category = monitorCategory;
//     await product58.save();
//     savedProducts.push(product58);
//     console.log(`Added product: ${product58.name}`);

//     const product59: Product = new Product();
//     product59.name = "MSI Optix MAG274QRF";
//     product59.price = 7990000;
//     product59.description =
//       "MSI Optix MAG274QRF 27-inch 1440p 165Hz Gaming Monitor";
//     product59.stock = 12;
//     product59.category = monitorCategory;
//     await product59.save();
//     savedProducts.push(product59);
//     console.log(`Added product: ${product59.name}`);

//     const product60: Product = new Product();
//     product60.name = "ViewSonic XG270QG";
//     product60.price = 9990000;
//     product60.description =
//       "ViewSonic XG270QG 27-inch 1440p 165Hz Gaming Monitor";
//     product60.stock = 8;
//     product60.category = monitorCategory;
//     await product60.save();
//     savedProducts.push(product60);
//     console.log(`Added product: ${product60.name}`);

//     // Additional Mouse Products
//     const product61: Product = new Product();
//     product61.name = "Glorious Model O Wireless";
//     product61.price = 2490000;
//     product61.description = "Glorious Model O Wireless Gaming Mouse";
//     product61.stock = 22;
//     product61.category = mouseCategory;
//     await product61.save();
//     savedProducts.push(product61);
//     console.log(`Added product: ${product61.name}`);

//     const product62: Product = new Product();
//     product62.name = "Pulsar Xlite V2";
//     product62.price = 1990000;
//     product62.description = "Pulsar Xlite V2 Wireless Gaming Mouse";
//     product62.stock = 18;
//     product62.category = mouseCategory;
//     await product62.save();
//     savedProducts.push(product62);
//     console.log(`Added product: ${product62.name}`);

//     const product63: Product = new Product();
//     product63.name = "Endgame Gear XM1r";
//     product63.price = 1790000;
//     product63.description = "Endgame Gear XM1r Gaming Mouse";
//     product63.stock = 15;
//     product63.category = mouseCategory;
//     await product63.save();
//     savedProducts.push(product63);
//     console.log(`Added product: ${product63.name}`);

//     // Additional Keyboard Products
//     const product64: Product = new Product();
//     product64.name = "Ducky One 3 RGB";
//     product64.price = 3990000;
//     product64.description = "Ducky One 3 RGB Mechanical Gaming Keyboard";
//     product64.stock = 16;
//     product64.category = keyboardCategory;
//     await product64.save();
//     savedProducts.push(product64);
//     console.log(`Added product: ${product64.name}`);

//     const product65: Product = new Product();
//     product65.name = "Varmilo VA87M";
//     product65.price = 3490000;
//     product65.description = "Varmilo VA87M Mechanical Gaming Keyboard";
//     product65.stock = 12;
//     product65.category = keyboardCategory;
//     await product65.save();
//     savedProducts.push(product65);
//     console.log(`Added product: ${product65.name}`);

//     const product66: Product = new Product();
//     product66.name = "Leopold FC900R";
//     product66.price = 2990000;
//     product66.description = "Leopold FC900R Mechanical Gaming Keyboard";
//     product66.stock = 14;
//     product66.category = keyboardCategory;
//     await product66.save();
//     savedProducts.push(product66);
//     console.log(`Added product: ${product66.name}`);

//     // Additional Headset Products
//     const product67: Product = new Product();
//     product67.name = "Beyerdynamic DT 990 Pro";
//     product67.price = 3990000;
//     product67.description = "Beyerdynamic DT 990 Pro Gaming Headset";
//     product67.stock = 18;
//     product67.category = headsetCategory;
//     await product67.save();
//     savedProducts.push(product67);
//     console.log(`Added product: ${product67.name}`);

//     const product68: Product = new Product();
//     product68.name = "Audio-Technica ATH-M50x";
//     product68.price = 3490000;
//     product68.description = "Audio-Technica ATH-M50x Gaming Headset";
//     product68.stock = 20;
//     product68.category = headsetCategory;
//     await product68.save();
//     savedProducts.push(product68);
//     console.log(`Added product: ${product68.name}`);

//     const product69: Product = new Product();
//     product69.name = "Sennheiser HD 560S";
//     product69.price = 4490000;
//     product69.description = "Sennheiser HD 560S Gaming Headset";
//     product69.stock = 12;
//     product69.category = headsetCategory;
//     await product69.save();
//     savedProducts.push(product69);
//     console.log(`Added product: ${product69.name}`);

//     // Additional Network Card Products
//     const product70: Product = new Product();
//     product70.name = "ASUS PCE-AX58BT";
//     product70.price = 2490000;
//     product70.description = "ASUS PCE-AX58BT WiFi 6 Wireless Network Adapter";
//     product70.stock = 16;
//     product70.category = networkCardCategory;
//     await product70.save();
//     savedProducts.push(product70);
//     console.log(`Added product: ${product70.name}`);

//     const product71: Product = new Product();
//     product71.name = "Gigabyte GC-WBAX200";
//     product71.price = 1990000;
//     product71.description =
//       "Gigabyte GC-WBAX200 WiFi 6 Wireless Network Adapter";
//     product71.stock = 18;
//     product71.category = networkCardCategory;
//     await product71.save();
//     savedProducts.push(product71);
//     console.log(`Added product: ${product71.name}`);

//     const product72: Product = new Product();
//     product72.name = "MSI AX1800";
//     product72.price = 1790000;
//     product72.description = "MSI AX1800 WiFi 6 Wireless Network Adapter";
//     product72.stock = 14;
//     product72.category = networkCardCategory;
//     await product72.save();
//     savedProducts.push(product72);
//     console.log(`Added product: ${product72.name}`);

//     // 10 new DDR5 RAM products
//     const product100: Product = new Product();
//     product100.name = "Corsair Dominator Platinum RGB 32GB DDR5-6000";
//     product100.price = 4990000;
//     product100.description = "Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5-6000MHz";
//     product100.stock = 15;
//     product100.category = ramCategory;
//     await product100.save();
//     savedProducts.push(product100);
//     console.log(`Added product: ${product100.name}`);

//     const product101: Product = new Product();
//     product101.name = "G.Skill Ripjaws S5 32GB DDR5-5600";
//     product101.price = 4290000;
//     product101.description = "G.Skill Ripjaws S5 32GB (2x16GB) DDR5-5600MHz";
//     product101.stock = 18;
//     product101.category = ramCategory;
//     await product101.save();
//     savedProducts.push(product101);
//     console.log(`Added product: ${product101.name}`);

//     const product102: Product = new Product();
//     product102.name = "Kingston Fury Beast 32GB DDR5-6000";
//     product102.price = 4590000;
//     product102.description = "Kingston Fury Beast 32GB (2x16GB) DDR5-6000MHz";
//     product102.stock = 20;
//     product102.category = ramCategory;
//     await product102.save();
//     savedProducts.push(product102);
//     console.log(`Added product: ${product102.name}`);

//     const product103: Product = new Product();
//     product103.name = "TeamGroup T-Force Delta RGB 32GB DDR5-6400";
//     product103.price = 5690000;
//     product103.description = "TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5-6400MHz";
//     product103.stock = 12;
//     product103.category = ramCategory;
//     await product103.save();
//     savedProducts.push(product103);
//     console.log(`Added product: ${product103.name}`);

//     const product104: Product = new Product();
//     product104.name = "Crucial Pro 32GB DDR5-5600";
//     product104.price = 3990000;
//     product104.description = "Crucial Pro 32GB (2x16GB) DDR5-5600MHz";
//     product104.stock = 16;
//     product104.category = ramCategory;
//     await product104.save();
//     savedProducts.push(product104);
//     console.log(`Added product: ${product104.name}`);

//     const product105: Product = new Product();
//     product105.name = "Patriot Viper Venom 32GB DDR5-6200";
//     product105.price = 4890000;
//     product105.description = "Patriot Viper Venom 32GB (2x16GB) DDR5-6200MHz";
//     product105.stock = 10;
//     product105.category = ramCategory;
//     await product105.save();
//     savedProducts.push(product105);
//     console.log(`Added product: ${product105.name}`);

//     const product106: Product = new Product();
//     product106.name = "ADATA XPG Lancer RGB 32GB DDR5-6000";
//     product106.price = 4790000;
//     product106.description = "ADATA XPG Lancer RGB 32GB (2x16GB) DDR5-6000MHz";
//     product106.stock = 14;
//     product106.category = ramCategory;
//     await product106.save();
//     savedProducts.push(product106);
//     console.log(`Added product: ${product106.name}`);

//     const product107: Product = new Product();
//     product107.name = "PNY XLR8 Gaming 32GB DDR5-6000";
//     product107.price = 4690000;
//     product107.description = "PNY XLR8 Gaming 32GB (2x16GB) DDR5-6000MHz";
//     product107.stock = 11;
//     product107.category = ramCategory;
//     await product107.save();
//     savedProducts.push(product107);
//     console.log(`Added product: ${product107.name}`);

//     const product108: Product = new Product();
//     product108.name = "Samsung 32GB DDR5-4800";
//     product108.price = 3590000;
//     product108.description = "Samsung 32GB (2x16GB) DDR5-4800MHz";
//     product108.stock = 22;
//     product108.category = ramCategory;
//     await product108.save();
//     savedProducts.push(product108);
//     console.log(`Added product: ${product108.name}`);

//     const product109: Product = new Product();
//     product109.name = "Lexar ARES RGB 32GB DDR5-5600";
//     product109.price = 4190000;
//     product109.description = "Lexar ARES RGB 32GB (2x16GB) DDR5-5600MHz";
//     product109.stock = 13;
//     product109.category = ramCategory;
//     await product109.save();
//     savedProducts.push(product109);
//     console.log(`Added product: ${product109.name}`);

//     console.log(`Successfully added ${savedProducts.length} products`);
//     return savedProducts;
//   }

//   async addToComponents() {
//     // Get existing products from database using Active Records
//     const products = await Product.find({
//       where: { isActive: true },
//       relations: ["category"],
//     });

//     const savedComponents = [];

//     // CPU Components
//     const cpuProducts = products.filter((p) => p.category?.slug === "cpu");
//     for (const product of cpuProducts) {
//       if (!product.name) continue;

//       const cpu: CPU = new CPU();
//       cpu.product = product;

//       if (product.name.includes("Intel Core i9-13900K")) {
//         cpu.cores = 24;
//         cpu.threads = 32;
//         cpu.baseClock = "3.0 GHz";
//         cpu.boostClock = "5.8 GHz";
//         cpu.socket = "LGA 1700";
//         cpu.architecture = "Raptor Lake";
//         cpu.tdp = 253;
//         cpu.integratedGraphics = "Intel UHD Graphics 770";
//       } else if (product.name.includes("AMD Ryzen 9 7950X")) {
//         cpu.cores = 16;
//         cpu.threads = 32;
//         cpu.baseClock = "4.5 GHz";
//         cpu.boostClock = "5.7 GHz";
//         cpu.socket = "AM5";
//         cpu.architecture = "Zen 4";
//         cpu.tdp = 170;
//         cpu.integratedGraphics = "AMD Radeon Graphics";
//       } else if (product.name.includes("Intel Core i7-13700K")) {
//         cpu.cores = 16;
//         cpu.threads = 24;
//         cpu.baseClock = "3.4 GHz";
//         cpu.boostClock = "5.4 GHz";
//         cpu.socket = "LGA 1700";
//         cpu.architecture = "Raptor Lake";
//         cpu.tdp = 253;
//         cpu.integratedGraphics = "Intel UHD Graphics 770";
//       } else if (product.name.includes("AMD Ryzen 7 7700X")) {
//         cpu.cores = 8;
//         cpu.threads = 16;
//         cpu.baseClock = "4.5 GHz";
//         cpu.boostClock = "5.4 GHz";
//         cpu.socket = "AM5";
//         cpu.architecture = "Zen 4";
//         cpu.tdp = 105;
//         cpu.integratedGraphics = "AMD Radeon Graphics";
//       } else if (product.name.includes("AMD Ryzen 5 7600X")) {
//         cpu.cores = 6;
//         cpu.threads = 12;
//         cpu.baseClock = "4.7 GHz";
//         cpu.boostClock = "5.3 GHz";
//         cpu.socket = "AM5";
//         cpu.architecture = "Zen 4";
//         cpu.tdp = 105;
//         cpu.integratedGraphics = "AMD Radeon Graphics";
//       } else if (product.name.includes("Intel Core i5-13600K")) {
//         cpu.cores = 14;
//         cpu.threads = 20;
//         cpu.baseClock = "3.5 GHz";
//         cpu.boostClock = "5.1 GHz";
//         cpu.socket = "LGA 1700";
//         cpu.architecture = "Raptor Lake";
//         cpu.tdp = 181;
//         cpu.integratedGraphics = "Intel UHD Graphics 770";
//       } else if (product.name.includes("AMD Ryzen 7 5800X3D")) {
//         cpu.cores = 8;
//         cpu.threads = 16;
//         cpu.baseClock = "3.4 GHz";
//         cpu.boostClock = "4.5 GHz";
//         cpu.socket = "AM4";
//         cpu.architecture = "Zen 3";
//         cpu.tdp = 105;
//         cpu.integratedGraphics = "";
//       }

//       await cpu.save();
//       savedComponents.push(cpu);
//       console.log(`Added CPU component for: ${product.name}`);
//     }

//     // GPU Components
//     const gpuProducts = products.filter((p) => p.category?.slug === "gpu");
//     for (const product of gpuProducts) {
//       if (!product.name) continue;

//       const gpu: GPU = new GPU();
//       gpu.product = product;

//       if (product.name.includes("NVIDIA GeForce RTX 4090")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4090";
//         gpu.vram = 24;
//         gpu.chipset = "AD102";
//         gpu.memoryType = "GDDR6X";
//         gpu.lengthMm = 304;
//       } else if (product.name.includes("AMD Radeon RX 7900 XTX")) {
//         gpu.brand = "AMD";
//         gpu.model = "Radeon RX 7900 XTX";
//         gpu.vram = 24;
//         gpu.chipset = "Navi 31";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 287;
//       } else if (product.name.includes("NVIDIA GeForce RTX 4080")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4080";
//         gpu.vram = 16;
//         gpu.chipset = "AD103";
//         gpu.memoryType = "GDDR6X";
//         gpu.lengthMm = 304;
//       } else if (product.name.includes("AMD Radeon RX 7800 XT")) {
//         gpu.brand = "AMD";
//         gpu.model = "Radeon RX 7800 XT";
//         gpu.vram = 16;
//         gpu.chipset = "Navi 32";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 267;
//       } else if (product.name.includes("NVIDIA GeForce RTX 4070 Ti")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4070 Ti";
//         gpu.vram = 12;
//         gpu.chipset = "AD104";
//         gpu.memoryType = "GDDR6X";
//         gpu.lengthMm = 285;
//       } else if (product.name.includes("AMD Radeon RX 7700 XT")) {
//         gpu.brand = "AMD";
//         gpu.model = "Radeon RX 7700 XT";
//         gpu.vram = 12;
//         gpu.chipset = "Navi 32";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 267;
//       } else if (product.name.includes("NVIDIA GeForce RTX 4060 Ti")) {
//         gpu.brand = "NVIDIA";
//         gpu.model = "GeForce RTX 4060 Ti";
//         gpu.vram = 8;
//         gpu.chipset = "AD106";
//         gpu.memoryType = "GDDR6";
//         gpu.lengthMm = 242;
//       }

//       await gpu.save();
//       savedComponents.push(gpu);
//       console.log(`Added GPU component for: ${product.name}`);
//     }

//     // RAM Components
//     const ramProducts = products.filter((p) => p.category?.slug === "ram");
//     for (const product of ramProducts) {
//       if (!product.name) continue;

//       const ram: RAM = new RAM();
//       ram.product = product;

//       if (product.name.includes("Corsair Vengeance RGB Pro 32GB")) {
//         ram.brand = "Corsair";
//         ram.model = "Vengeance RGB Pro";
//         ram.capacityGb = 32;
//         ram.speedMhz = 3600;
//         ram.type = "DDR4";
//       } else if (product.name.includes("G.Skill Trident Z5 RGB 32GB")) {
//         ram.brand = "G.Skill";
//         ram.model = "Trident Z5 RGB";
//         ram.capacityGb = 32;
//         ram.speedMhz = 6000;
//         ram.type = "DDR5";
//       } else if (product.name.includes("Kingston Fury Beast 16GB")) {
//         ram.brand = "Kingston";
//         ram.model = "Fury Beast";
//         ram.capacityGb = 16;
//         ram.speedMhz = 3200;
//         ram.type = "DDR4";
//       } else if (product.name.includes("Crucial Ballistix MAX 64GB")) {
//         ram.brand = "Crucial";
//         ram.model = "Ballistix MAX";
//         ram.capacityGb = 64;
//         ram.speedMhz = 4000;
//         ram.type = "DDR4";
//       } else if (product.name.includes("TeamGroup T-Force Delta RGB 32GB")) {
//         ram.brand = "TeamGroup";
//         ram.model = "T-Force Delta RGB";
//         ram.capacityGb = 32;
//         ram.speedMhz = 3600;
//         ram.type = "DDR4";
//       } else if (product.name.includes("Patriot Viper Steel 16GB")) {
//         ram.brand = "Patriot";
//         ram.model = "Viper Steel";
//         ram.capacityGb = 16;
//         ram.speedMhz = 3200;
//         ram.type = "DDR4";
//       }

//       await ram.save();
//       savedComponents.push(ram);
//       console.log(`Added RAM component for: ${product.name}`);
//     }

//     // Drive Components
//     const driveProducts = products.filter((p) => p.category?.slug === "drive");
//     for (const product of driveProducts) {
//       if (!product.name) continue;

//       const drive: Drive = new Drive();
//       drive.product = product;

//       if (product.name.includes("Samsung 970 EVO Plus 1TB")) {
//         drive.brand = "Samsung";
//         drive.model = "970 EVO Plus";
//         drive.type = "SSD";
//         drive.capacityGb = 1000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("WD Black SN850X 2TB")) {
//         drive.brand = "Western Digital";
//         drive.model = "Black SN850X";
//         drive.type = "SSD";
//         drive.capacityGb = 2000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("Seagate Barracuda 2TB")) {
//         drive.brand = "Seagate";
//         drive.model = "Barracuda";
//         drive.type = "HDD";
//         drive.capacityGb = 2000;
//         drive.interface = "SATA 6Gb/s";
//       } else if (product.name.includes("Crucial P5 Plus 1TB")) {
//         drive.brand = "Crucial";
//         drive.model = "P5 Plus";
//         drive.type = "SSD";
//         drive.capacityGb = 1000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("Sabrent Rocket 4 Plus 2TB")) {
//         drive.brand = "Sabrent";
//         drive.model = "Rocket 4 Plus";
//         drive.type = "SSD";
//         drive.capacityGb = 2000;
//         drive.interface = "NVMe M.2";
//       } else if (product.name.includes("Western Digital Blue 4TB")) {
//         drive.brand = "Western Digital";
//         drive.model = "Blue";
//         drive.type = "HDD";
//         drive.capacityGb = 4000;
//         drive.interface = "SATA 6Gb/s";
//       }

//       await drive.save();
//       savedComponents.push(drive);
//       console.log(`Added Drive component for: ${product.name}`);
//     }

//     // Motherboard Components
//     const motherboardProducts = products.filter(
//       (p) => p.category?.slug === "motherboard"
//     );
//     for (const product of motherboardProducts) {
//       if (!product.name) continue;

//       const motherboard: Motherboard = new Motherboard();
//       motherboard.product = product;

//       if (product.name.includes("ASUS ROG Maximus Z790 Hero")) {
//         motherboard.brand = "ASUS";
//         motherboard.model = "ROG Maximus Z790 Hero";
//         motherboard.chipset = "Intel Z790";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("MSI MPG B650 Carbon WiFi")) {
//         motherboard.brand = "MSI";
//         motherboard.model = "MPG B650 Carbon WiFi";
//         motherboard.chipset = "AMD B650";
//         motherboard.socket = "AM5";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("Gigabyte B760 Aorus Elite")) {
//         motherboard.brand = "Gigabyte";
//         motherboard.model = "B760 Aorus Elite";
//         motherboard.chipset = "Intel B760";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("ASRock B650E PG Riptide WiFi")) {
//         motherboard.brand = "ASRock";
//         motherboard.model = "B650E PG Riptide WiFi";
//         motherboard.chipset = "AMD B650E";
//         motherboard.socket = "AM5";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("MSI PRO Z690-A WiFi")) {
//         motherboard.brand = "MSI";
//         motherboard.model = "PRO Z690-A WiFi";
//         motherboard.chipset = "Intel Z690";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "ATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       } else if (product.name.includes("ASUS TUF Gaming B760M-Plus WiFi")) {
//         motherboard.brand = "ASUS";
//         motherboard.model = "TUF Gaming B760M-Plus WiFi";
//         motherboard.chipset = "Intel B760";
//         motherboard.socket = "LGA 1700";
//         motherboard.formFactor = "mATX";
//         motherboard.ramSlots = 4;
//         motherboard.maxRam = 128;
//       }

//       await motherboard.save();
//       savedComponents.push(motherboard);
//       console.log(`Added Motherboard component for: ${product.name}`);
//     }

//     // PSU Components
//     const psuProducts = products.filter((p) => p.category?.slug === "psu");
//     for (const product of psuProducts) {
//       if (!product.name) continue;

//       const psu: PSU = new PSU();
//       psu.product = product;

//       if (product.name.includes("Corsair RM850x")) {
//         psu.brand = "Corsair";
//         psu.model = "RM850x";
//         psu.wattage = 850;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("Seasonic Focus GX-750")) {
//         psu.brand = "Seasonic";
//         psu.model = "Focus GX-750";
//         psu.wattage = 750;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("EVGA SuperNOVA 1000W")) {
//         psu.brand = "EVGA";
//         psu.model = "SuperNOVA 1000W";
//         psu.wattage = 1000;
//         psu.efficiencyRating = "80+ Platinum";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("be quiet! Straight Power 11 850W")) {
//         psu.brand = "be quiet!";
//         psu.model = "Straight Power 11 850W";
//         psu.wattage = 850;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("Cooler Master V850 Gold V2")) {
//         psu.brand = "Cooler Master";
//         psu.model = "V850 Gold V2";
//         psu.wattage = 850;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       } else if (product.name.includes("Thermaltake Toughpower GF1 750W")) {
//         psu.brand = "Thermaltake";
//         psu.model = "Toughpower GF1 750W";
//         psu.wattage = 750;
//         psu.efficiencyRating = "80+ Gold";
//         psu.modular = "Fully Modular";
//       }

//       await psu.save();
//       savedComponents.push(psu);
//       console.log(`Added PSU component for: ${product.name}`);
//     }

//     // Case Components
//     const caseProducts = products.filter((p) => p.category?.slug === "case");
//     for (const product of caseProducts) {
//       if (!product.name) continue;

//       const caseComponent: Case = new Case();
//       caseComponent.product = product;

//       if (product.name.includes("NZXT H510 Elite")) {
//         caseComponent.brand = "NZXT";
//         caseComponent.model = "H510 Elite";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = true;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Lian Li O11 Dynamic")) {
//         caseComponent.brand = "Lian Li";
//         caseComponent.model = "O11 Dynamic";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Phanteks Enthoo 719")) {
//         caseComponent.brand = "Phanteks";
//         caseComponent.model = "Enthoo 719";
//         caseComponent.formFactorSupport = "E-ATX, ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Fractal Design Meshify C")) {
//         caseComponent.brand = "Fractal Design";
//         caseComponent.model = "Meshify C";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("be quiet! Pure Base 500DX")) {
//         caseComponent.brand = "be quiet!";
//         caseComponent.model = "Pure Base 500DX";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = true;
//         caseComponent.sidePanelType = "Tempered Glass";
//       } else if (product.name.includes("Corsair 4000D Airflow")) {
//         caseComponent.brand = "Corsair";
//         caseComponent.model = "4000D Airflow";
//         caseComponent.formFactorSupport = "ATX, mATX, ITX";
//         caseComponent.hasRgb = false;
//         caseComponent.sidePanelType = "Tempered Glass";
//       }

//       await caseComponent.save();
//       savedComponents.push(caseComponent);
//       console.log(`Added Case component for: ${product.name}`);
//     }

//     // Monitor Components
//     const monitorProducts = products.filter(
//       (p) => p.category?.slug === "monitor"
//     );
//     for (const product of monitorProducts) {
//       if (!product.name) continue;

//       const monitor: Monitor = new Monitor();
//       monitor.product = product;

//       if (product.name.includes("Samsung Odyssey G9")) {
//         monitor.brand = "Samsung";
//         monitor.model = "Odyssey G9";
//         monitor.sizeInch = 49.0;
//         monitor.resolution = "5120x1440";
//         monitor.refreshRate = 240;
//         monitor.panelType = "VA";
//       } else if (product.name.includes("LG 27GP850-B")) {
//         monitor.brand = "LG";
//         monitor.model = "27GP850-B";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       } else if (product.name.includes("ASUS ROG Swift PG279Q")) {
//         monitor.brand = "ASUS";
//         monitor.model = "ROG Swift PG279Q";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       } else if (product.name.includes("AOC CU34G2X")) {
//         monitor.brand = "AOC";
//         monitor.model = "CU34G2X";
//         monitor.sizeInch = 34.0;
//         monitor.resolution = "3440x1440";
//         monitor.refreshRate = 144;
//         monitor.panelType = "VA";
//       } else if (product.name.includes("MSI Optix MAG274QRF")) {
//         monitor.brand = "MSI";
//         monitor.model = "Optix MAG274QRF";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       } else if (product.name.includes("ViewSonic XG270QG")) {
//         monitor.brand = "ViewSonic";
//         monitor.model = "XG270QG";
//         monitor.sizeInch = 27.0;
//         monitor.resolution = "2560x1440";
//         monitor.refreshRate = 165;
//         monitor.panelType = "IPS";
//       }

//       await monitor.save();
//       savedComponents.push(monitor);
//       console.log(`Added Monitor component for: ${product.name}`);
//     }

//     // Mouse Components
//     const mouseProducts = products.filter((p) => p.category?.slug === "mouse");
//     for (const product of mouseProducts) {
//       if (!product.name) continue;

//       const mouse: Mouse = new Mouse();
//       mouse.product = product;

//       if (product.name.includes("Logitech G Pro X Superlight")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 25600;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = false;
//       } else if (product.name.includes("Razer DeathAdder V3 Pro")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 30000;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = true;
//       } else if (product.name.includes("SteelSeries Rival 600")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 12000;
//         mouse.connectivity = "Wired";
//         mouse.hasRgb = true;
//       } else if (product.name.includes("Glorious Model O Wireless")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 19000;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = true;
//       } else if (product.name.includes("Pulsar Xlite V2")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 19000;
//         mouse.connectivity = "Wireless";
//         mouse.hasRgb = false;
//       } else if (product.name.includes("Endgame Gear XM1r")) {
//         mouse.type = "Gaming";
//         mouse.dpi = 19000;
//         mouse.connectivity = "Wired";
//         mouse.hasRgb = false;
//       }

//       await mouse.save();
//       savedComponents.push(mouse);
//       console.log(`Added Mouse component for: ${product.name}`);
//     }

//     // Keyboard Components
//     const keyboardProducts = products.filter(
//       (p) => p.category?.slug === "keyboard"
//     );
//     for (const product of keyboardProducts) {
//       if (!product.name) continue;

//       const keyboard: Keyboard = new Keyboard();
//       keyboard.product = product;

//       if (product.name.includes("Corsair K100 RGB")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Optical-Mechanical";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("Razer BlackWidow V3 Pro")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Razer Yellow";
//         keyboard.connectivity = "Wireless";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("SteelSeries Apex Pro")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "OmniPoint";
//         keyboard.connectivity = "Wireless";
//         keyboard.layout = "TKL";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("Ducky One 3 RGB")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Cherry MX";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = true;
//       } else if (product.name.includes("Varmilo VA87M")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Cherry MX";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "TKL";
//         keyboard.hasRgb = false;
//       } else if (product.name.includes("Leopold FC900R")) {
//         keyboard.type = "Mechanical";
//         keyboard.switchType = "Cherry MX";
//         keyboard.connectivity = "Wired";
//         keyboard.layout = "Full-size";
//         keyboard.hasRgb = false;
//       }

//       await keyboard.save();
//       savedComponents.push(keyboard);
//       console.log(`Added Keyboard component for: ${product.name}`);
//     }

//     // Headset Components
//     const headsetProducts = products.filter(
//       (p) => p.category?.slug === "headset"
//     );
//     for (const product of headsetProducts) {
//       if (!product.name) continue;

//       const headset: Headset = new Headset();
//       headset.product = product;

//       if (product.name.includes("SteelSeries Arctis Pro Wireless")) {
//         headset.hasMicrophone = true;
//         headset.connectivity = "Wireless";
//         headset.surroundSound = true;
//       } else if (product.name.includes("HyperX Cloud Alpha")) {
//         headset.hasMicrophone = true;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       } else if (product.name.includes("Logitech G Pro X")) {
//         headset.hasMicrophone = true;
//         headset.connectivity = "Wireless";
//         headset.surroundSound = true;
//       } else if (product.name.includes("Beyerdynamic DT 990 Pro")) {
//         headset.hasMicrophone = false;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       } else if (product.name.includes("Audio-Technica ATH-M50x")) {
//         headset.hasMicrophone = false;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       } else if (product.name.includes("Sennheiser HD 560S")) {
//         headset.hasMicrophone = false;
//         headset.connectivity = "Wired";
//         headset.surroundSound = false;
//       }

//       await headset.save();
//       savedComponents.push(headset);
//       console.log(`Added Headset component for: ${product.name}`);
//     }

//     // Network Card Components
//     const networkCardProducts = products.filter(
//       (p) => p.category?.slug === "network-card"
//     );
//     for (const product of networkCardProducts) {
//       if (!product.name) continue;

//       const networkCard: NetworkCard = new NetworkCard();
//       networkCard.product = product;

//       if (product.name.includes("Intel AX200 WiFi 6")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "M.2";
//         networkCard.speedMbps = 2400;
//       } else if (product.name.includes("ASUS PCE-AC88")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 2100;
//       } else if (product.name.includes("TP-Link Archer T9E")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 1900;
//       } else if (product.name.includes("ASUS PCE-AX58BT")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 2400;
//       } else if (product.name.includes("Gigabyte GC-WBAX200")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "M.2";
//         networkCard.speedMbps = 2400;
//       } else if (product.name.includes("MSI AX1800")) {
//         networkCard.type = "WiFi";
//         networkCard.interface = "PCIe";
//         networkCard.speedMbps = 1800;
//       }

//       await networkCard.save();
//       savedComponents.push(networkCard);
//       console.log(`Added Network Card component for: ${product.name}`);
//     }

//     console.log(
//       `Successfully added ${savedComponents.length} component records`
//     );
//     return savedComponents;
//   }

// async addLaptops() {
//     const laptopCategory = await Category.findOne({
//       where: { slug: "laptop" },
//     });
//     if (!laptopCategory) {
//       throw new Error("Laptop category not found");
//     }

//     const savedLaptops = [];

//     // Gaming Laptops
//     const laptop1: Product = new Product();
//     laptop1.name = "ASUS ROG Strix G15 G513";
//     laptop1.price = 25990000;
//     laptop1.description = "ASUS ROG Strix G15 Gaming Laptop with AMD Ryzen 7 and RTX 3070";
//     laptop1.stock = 8;
//     laptop1.category = laptopCategory;
//     await laptop1.save();
//     savedLaptops.push(laptop1);
//     console.log(`Added laptop: ${laptop1.name}`);

//     const laptop2: Product = new Product();
//     laptop2.name = "MSI GE76 Raider";
//     laptop2.price = 45990000;
//     laptop2.description = "MSI GE76 Raider Gaming Laptop with Intel Core i9 and RTX 4080";
//     laptop2.stock = 5;
//     laptop2.category = laptopCategory;
//     await laptop2.save();
//     savedLaptops.push(laptop2);
//     console.log(`Added laptop: ${laptop2.name}`);

//     const laptop3: Product = new Product();
//     laptop3.name = "Acer Predator Helios 300";
//     laptop3.price = 29990000;
//     laptop3.description = "Acer Predator Helios 300 Gaming Laptop with Intel Core i7 and RTX 3060";
//     laptop3.stock = 10;
//     laptop3.category = laptopCategory;
//     await laptop3.save();
//     savedLaptops.push(laptop3);
//     console.log(`Added laptop: ${laptop3.name}`);

//     const laptop4: Product = new Product();
//     laptop4.name = "Alienware x17 R2";
//     laptop4.price = 65990000;
//     laptop4.description = "Alienware x17 R2 Gaming Laptop with Intel Core i9 and RTX 4090";
//     laptop4.stock = 3;
//     laptop4.category = laptopCategory;
//     await laptop4.save();
//     savedLaptops.push(laptop4);
//     console.log(`Added laptop: ${laptop4.name}`);

//     const laptop5: Product = new Product();
//     laptop5.name = "Razer Blade 15";
//     laptop5.price = 52990000;
//     laptop5.description = "Razer Blade 15 Gaming Laptop with Intel Core i7 and RTX 4070";
//     laptop5.stock = 6;
//     laptop5.category = laptopCategory;
//     await laptop5.save();
//     savedLaptops.push(laptop5);
//     console.log(`Added laptop: ${laptop5.name}`);

//     // Business/Productivity Laptops
//     const laptop6: Product = new Product();
//     laptop6.name = "ThinkPad X1 Carbon Gen 11";
//     laptop6.price = 35990000;
//     laptop6.description = "Lenovo ThinkPad X1 Carbon Business Laptop with Intel Core i7";
//     laptop6.stock = 12;
//     laptop6.category = laptopCategory;
//     await laptop6.save();
//     savedLaptops.push(laptop6);
//     console.log(`Added laptop: ${laptop6.name}`);

//     const laptop7: Product = new Product();
//     laptop7.name = "MacBook Pro 16-inch M3";
//     laptop7.price = 59990000;
//     laptop7.description = "Apple MacBook Pro 16-inch with M3 Pro chip";
//     laptop7.stock = 8;
//     laptop7.category = laptopCategory;
//     await laptop7.save();
//     savedLaptops.push(laptop7);
//     console.log(`Added laptop: ${laptop7.name}`);

//     const laptop8: Product = new Product();
//     laptop8.name = "Dell XPS 13 Plus";
//     laptop8.price = 32990000;
//     laptop8.description = "Dell XPS 13 Plus Ultrabook with Intel Core i7";
//     laptop8.stock = 15;
//     laptop8.category = laptopCategory;
//     await laptop8.save();
//     savedLaptops.push(laptop8);
//     console.log(`Added laptop: ${laptop8.name}`);

//     const laptop9: Product = new Product();
//     laptop9.name = "HP Spectre x360";
//     laptop9.price = 28990000;
//     laptop9.description = "HP Spectre x360 2-in-1 Laptop with Intel Core i7";
//     laptop9.stock = 10;
//     laptop9.category = laptopCategory;
//     await laptop9.save();
//     savedLaptops.push(laptop9);
//     console.log(`Added laptop: ${laptop9.name}`);

//     const laptop10: Product = new Product();
//     laptop10.name = "ASUS ZenBook Pro 15";
//     laptop10.price = 38990000;
//     laptop10.description = "ASUS ZenBook Pro 15 Creative Laptop with Intel Core i9";
//     laptop10.stock = 7;
//     laptop10.category = laptopCategory;
//     await laptop10.save();
//     savedLaptops.push(laptop10);
//     console.log(`Added laptop: ${laptop10.name}`);

//     console.log(`Successfully added ${savedLaptops.length} laptop products`);
//     return savedLaptops;
//   }

// async addPCs() {
//     const pcCategory = await Category.findOne({
//       where: { slug: "pc" },
//     });
//     if (!pcCategory) {
//       throw new Error("PC category not found");
//     }

//     const savedPCs = [];

//     // Gaming PCs
//     const pc1: Product = new Product();
//     pc1.name = "NZXT BLD Gaming PC - RTX 4090";
//     pc1.price = 85990000;
//     pc1.description = "High-end Gaming PC with Intel Core i9-13900K and RTX 4090";
//     pc1.stock = 3;
//     pc1.category = pcCategory;
//     await pc1.save();
//     savedPCs.push(pc1);
//     console.log(`Added PC: ${pc1.name}`);

//     const pc2: Product = new Product();
//     pc2.name = "Origin Chronos Gaming PC";
//     pc2.price = 65990000;
//     pc2.description = "Gaming PC with AMD Ryzen 9 7900X and RTX 4080";
//     pc2.stock = 5;
//     pc2.category = pcCategory;
//     await pc2.save();
//     savedPCs.push(pc2);
//     console.log(`Added PC: ${pc2.name}`);

//     const pc3: Product = new Product();
//     pc3.name = "Corsair ONE i300 Gaming PC";
//     pc3.price = 75990000;
//     pc3.description = "Compact Gaming PC with Intel Core i9 and RTX 4070 Ti";
//     pc3.stock = 4;
//     pc3.category = pcCategory;
//     await pc3.save();
//     savedPCs.push(pc3);
//     console.log(`Added PC: ${pc3.name}`);

//     const pc4: Product = new Product();
//     pc4.name = "Alienware Aurora R15";
//     pc4.price = 55990000;
//     pc4.description = "Alienware Aurora Gaming Desktop with Intel Core i7 and RTX 4070";
//     pc4.stock = 6;
//     pc4.category = pcCategory;
//     await pc4.save();
//     savedPCs.push(pc4);
//     console.log(`Added PC: ${pc4.name}`);

//     const pc5: Product = new Product();
//     pc5.name = "MSI Aegis RS 13";
//     pc5.price = 45990000;
//     pc5.description = "MSI Gaming Desktop with Intel Core i7 and RTX 4060 Ti";
//     pc5.stock = 8;
//     pc5.category = pcCategory;
//     await pc5.save();
//     savedPCs.push(pc5);
//     console.log(`Added PC: ${pc5.name}`);

//     // Workstation PCs
//     const pc6: Product = new Product();
//     pc6.name = "HP Z6 G5 Workstation";
//     pc6.price = 95990000;
//     pc6.description = "Professional Workstation with Intel Xeon and RTX A6000";
//     pc6.stock = 2;
//     pc6.category = pcCategory;
//     await pc6.save();
//     savedPCs.push(pc6);
//     console.log(`Added PC: ${pc6.name}`);

//     const pc7: Product = new Product();
//     pc7.name = "Dell Precision 7000";
//     pc7.price = 78990000;
//     pc7.description = "Dell Precision Workstation with Intel Core i9 and RTX A5000";
//     pc7.stock = 3;
//     pc7.category = pcCategory;
//     await pc7.save();
//     savedPCs.push(pc7);
//     console.log(`Added PC: ${pc7.name}`);

//     // Budget PCs
//     const pc8: Product = new Product();
//     pc8.name = "HP Pavilion Desktop";
//     pc8.price = 18990000;
//     pc8.description = "Budget Desktop PC with AMD Ryzen 5 and GTX 1660";
//     pc8.stock = 15;
//     pc8.category = pcCategory;
//     await pc8.save();
//     savedPCs.push(pc8);
//     console.log(`Added PC: ${pc8.name}`);

//     const pc9: Product = new Product();
//     pc9.name = "ASUS VivoPC Mini";
//     pc9.price = 12990000;
//     pc9.description = "Compact Mini PC with Intel Core i5 for Office Work";
//     pc9.stock = 20;
//     pc9.category = pcCategory;
//     await pc9.save();
//     savedPCs.push(pc9);
//     console.log(`Added PC: ${pc9.name}`);

//     const pc10: Product = new Product();
//     pc10.name = "Acer Aspire TC Desktop";
//     pc10.price = 15990000;
//     pc10.description = "Entry-level Desktop PC with AMD Ryzen 3 and integrated graphics";
//     pc10.stock = 18;
//     pc10.category = pcCategory;
//     await pc10.save();
//     savedPCs.push(pc10);
//     console.log(`Added PC: ${pc10.name}`);

//     console.log(`Successfully added ${savedPCs.length} PC products`);
//     return savedPCs;
//   }

// async addLaptopComponents() {
//     const laptops = await Product.find({
//       where: { isActive: true },
//       relations: ["category"],
//     });

//     const laptopProducts = laptops.filter((p) => p.category?.slug === "laptop");
//     const savedLaptopComponents = [];

//     for (const product of laptopProducts) {
//       if (!product.name) continue;

//       const laptop: Laptop = new Laptop();
//       laptop.product = product;

//       if (product.name.includes("ASUS ROG Strix G15 G513")) {
//         laptop.brand = "ASUS";
//         laptop.model = "ROG Strix G15 G513";
//         laptop.screenSize = 15.6;
//         laptop.screenType = "IPS";
//         laptop.resolution = "1920x1080";
//         laptop.batteryLifeHours = 6.0;
//         laptop.weightKg = 2.3;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("MSI GE76 Raider")) {
//         laptop.brand = "MSI";
//         laptop.model = "GE76 Raider";
//         laptop.screenSize = 17.3;
//         laptop.screenType = "IPS";
//         laptop.resolution = "1920x1080";
//         laptop.batteryLifeHours = 4.5;
//         laptop.weightKg = 2.9;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("Acer Predator Helios 300")) {
//         laptop.brand = "Acer";
//         laptop.model = "Predator Helios 300";
//         laptop.screenSize = 15.6;
//         laptop.screenType = "IPS";
//         laptop.resolution = "1920x1080";
//         laptop.batteryLifeHours = 5.0;
//         laptop.weightKg = 2.5;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("Alienware x17 R2")) {
//         laptop.brand = "Alienware";
//         laptop.model = "x17 R2";
//         laptop.screenSize = 17.3;
//         laptop.screenType = "IPS";
//         laptop.resolution = "2560x1440";
//         laptop.batteryLifeHours = 4.0;
//         laptop.weightKg = 3.1;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("Razer Blade 15")) {
//         laptop.brand = "Razer";
//         laptop.model = "Blade 15";
//         laptop.screenSize = 15.6;
//         laptop.screenType = "OLED";
//         laptop.resolution = "2560x1440";
//         laptop.batteryLifeHours = 5.5;
//         laptop.weightKg = 2.0;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("ThinkPad X1 Carbon Gen 11")) {
//         laptop.brand = "Lenovo";
//         laptop.model = "ThinkPad X1 Carbon Gen 11";
//         laptop.screenSize = 14.0;
//         laptop.screenType = "IPS";
//         laptop.resolution = "1920x1200";
//         laptop.batteryLifeHours = 12.0;
//         laptop.weightKg = 1.1;
//         laptop.os = "Windows 11 Pro";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("MacBook Pro 16-inch M3")) {
//         laptop.brand = "Apple";
//         laptop.model = "MacBook Pro 16-inch M3";
//         laptop.screenSize = 16.2;
//         laptop.screenType = "Liquid Retina XDR";
//         laptop.resolution = "3456x2234";
//         laptop.batteryLifeHours = 18.0;
//         laptop.weightKg = 2.1;
//         laptop.os = "macOS Sonoma";
//         laptop.ramCount = 1;
//       } else if (product.name.includes("Dell XPS 13 Plus")) {
//         laptop.brand = "Dell";
//         laptop.model = "XPS 13 Plus";
//         laptop.screenSize = 13.4;
//         laptop.screenType = "OLED";
//         laptop.resolution = "3456x2160";
//         laptop.batteryLifeHours = 10.0;
//         laptop.weightKg = 1.2;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("HP Spectre x360")) {
//         laptop.brand = "HP";
//         laptop.model = "Spectre x360";
//         laptop.screenSize = 13.5;
//         laptop.screenType = "IPS Touch";
//         laptop.resolution = "1920x1280";
//         laptop.batteryLifeHours = 11.0;
//         laptop.weightKg = 1.3;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       } else if (product.name.includes("ASUS ZenBook Pro 15")) {
//         laptop.brand = "ASUS";
//         laptop.model = "ZenBook Pro 15";
//         laptop.screenSize = 15.6;
//         laptop.screenType = "OLED";
//         laptop.resolution = "2880x1620";
//         laptop.batteryLifeHours = 8.0;
//         laptop.weightKg = 1.8;
//         laptop.os = "Windows 11";
//         laptop.ramCount = 2;
//       }

//       await laptop.save();
//       savedLaptopComponents.push(laptop);
//       console.log(`Added Laptop component for: ${product.name}`);
//     }

//     console.log(`Successfully added ${savedLaptopComponents.length} laptop component records`);
//     return savedLaptopComponents;
//   }

// async addPCComponents() {
//     const pcs = await Product.find({
//       where: { isActive: true },
//       relations: ["category"],
//     });

//     const pcProducts = pcs.filter((p) => p.category?.slug === "pc");
//     const savedPCComponents = [];

//     for (const product of pcProducts) {
//       if (!product.name) continue;

//       const pc: PC = new PC();
//       pc.product = product;

//       if (product.name.includes("NZXT BLD Gaming PC - RTX 4090")) {
//         pc.brand = "NZXT";
//         pc.model = "BLD Gaming PC";
//         pc.processor = "Intel Core i9-13900K";
//         pc.ramGb = 32;
//         pc.storageGb = 2000;
//         pc.storageType = "NVMe SSD";
//         pc.graphics = "NVIDIA GeForce RTX 4090";
//         pc.formFactor = "Mid Tower";
//         pc.powerSupplyWattage = 1000;
//         pc.operatingSystem = "Windows 11 Pro";
//       } else if (product.name.includes("Origin Chronos Gaming PC")) {
//         pc.brand = "Origin";
//         pc.model = "Chronos";
//         pc.processor = "AMD Ryzen 9 7900X";
//         pc.ramGb = 32;
//         pc.storageGb = 1000;
//         pc.storageType = "NVMe SSD";
//         pc.graphics = "NVIDIA GeForce RTX 4080";
//         pc.formFactor = "Mid Tower";
//         pc.powerSupplyWattage = 850;
//         pc.operatingSystem = "Windows 11 Pro";
//       } else if (product.name.includes("Corsair ONE i300 Gaming PC")) {
//         pc.brand = "Corsair";
//         pc.model = "ONE i300";
//         pc.processor = "Intel Core i9-12900K";
//         pc.ramGb = 32;
//         pc.storageGb = 1000;
//         pc.storageType = "NVMe SSD";
//         pc.graphics = "NVIDIA GeForce RTX 4070 Ti";
//         pc.formFactor = "Compact";
//         pc.powerSupplyWattage = 750;
//         pc.operatingSystem = "Windows 11 Pro";
//       } else if (product.name.includes("Alienware Aurora R15")) {
//         pc.brand = "Alienware";
//         pc.model = "Aurora R15";
//         pc.processor = "Intel Core i7-13700F";
//         pc.ramGb = 16;
//         pc.storageGb = 1000;
//         pc.storageType = "NVMe SSD";
//         pc.graphics = "NVIDIA GeForce RTX 4070";
//         pc.formFactor = "Mid Tower";
//         pc.powerSupplyWattage = 750;
//         pc.operatingSystem = "Windows 11 Home";
//       } else if (product.name.includes("MSI Aegis RS 13")) {
//         pc.brand = "MSI";
//         pc.model = "Aegis RS 13";
//         pc.processor = "Intel Core i7-13700F";
//         pc.ramGb = 16;
//         pc.storageGb = 1000;
//         pc.storageType = "NVMe SSD";
//         pc.graphics = "NVIDIA GeForce RTX 4060 Ti";
//         pc.formFactor = "Mid Tower";
//         pc.powerSupplyWattage = 650;
//         pc.operatingSystem = "Windows 11 Home";
//       } else if (product.name.includes("HP Z6 G5 Workstation")) {
//         pc.brand = "HP";
//         pc.model = "Z6 G5 Workstation";
//         pc.processor = "Intel Xeon W-2400";
//         pc.ramGb = 64;
//         pc.storageGb = 2000;
//         pc.storageType = "NVMe SSD";
//         pc.graphics = "NVIDIA RTX A6000";
//         pc.formFactor = "Full Tower";
//         pc.powerSupplyWattage = 1125;
//         pc.operatingSystem = "Windows 11 Pro";
//       } else if (product.name.includes("Dell Precision 7000")) {
//         pc.brand = "Dell";
//         pc.model = "Precision 7000";
//         pc.processor = "Intel Core i9-13900";
//         pc.ramGb = 32;
//         pc.storageGb = 1000;
//         pc.storageType = "NVMe SSD";
//         pc.graphics = "NVIDIA RTX A5000";
//         pc.formFactor = "Mid Tower";
//         pc.powerSupplyWattage = 850;
//         pc.operatingSystem = "Windows 11 Pro";
//       } else if (product.name.includes("HP Pavilion Desktop")) {
//         pc.brand = "HP";
//         pc.model = "Pavilion Desktop";
//         pc.processor = "AMD Ryzen 5 5600G";
//         pc.ramGb = 16;
//         pc.storageGb = 512;
//         pc.storageType = "SATA SSD";
//         pc.graphics = "NVIDIA GTX 1660";
//         pc.formFactor = "Mid Tower";
//         pc.powerSupplyWattage = 500;
//         pc.operatingSystem = "Windows 11 Home";
//       } else if (product.name.includes("ASUS VivoPC Mini")) {
//         pc.brand = "ASUS";
//         pc.model = "VivoPC Mini";
//         pc.processor = "Intel Core i5-12400";
//         pc.ramGb = 8;
//         pc.storageGb = 256;
//         pc.storageType = "SATA SSD";
//         pc.graphics = "Intel UHD Graphics";
//         pc.formFactor = "Mini ITX";
//         pc.powerSupplyWattage = 90;
//         pc.operatingSystem = "Windows 11 Home";
//       } else if (product.name.includes("Acer Aspire TC Desktop")) {
//         pc.brand = "Acer";
//         pc.model = "Aspire TC";
//         pc.processor = "AMD Ryzen 3 5300G";
//         pc.ramGb = 8;
//         pc.storageGb = 512;
//         pc.storageType = "SATA SSD";
//         pc.graphics = "AMD Radeon Graphics";
//         pc.formFactor = "Mid Tower";
//         pc.powerSupplyWattage = 350;
//         pc.operatingSystem = "Windows 11 Home";
//       }

//       await pc.save();
//       savedPCComponents.push(pc);
//       console.log(`Added PC component for: ${product.name}`);
//     }

//     console.log(`Successfully added ${savedPCComponents.length} PC component records`);
//     return savedPCComponents;
//   }

// Add this new function at the end of the file or after the existing RAM section
// export async function addMoreDDR5Rams() {
//   const savedProducts: Product[] = [];
//   const ramCategory = await Category.findOne({
//     where: { name: "RAM" },
//   });
//   if (!ramCategory) {
//     throw new Error("RAM category not found");
//   }
//   const product100: Product = new Product();
//   product100.name = "Corsair Dominator Platinum RGB 32GB DDR5-6000";
//   product100.price = 4990000;
//   product100.description =
//     "Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5-6000MHz";
//   product100.stock = 15;
//   product100.category = ramCategory;
//   await product100.save();
//   console.log(`Added product: ${product100.name}`);

//   const product101: Product = new Product();
//   product101.name = "G.Skill Ripjaws S5 32GB DDR5-5600";
//   product101.price = 4290000;
//   product101.description = "G.Skill Ripjaws S5 32GB (2x16GB) DDR5-5600MHz";
//   product101.stock = 18;
//   product101.category = ramCategory;
//   await product101.save();
//   savedProducts.push(product101);
//   console.log(`Added product: ${product101.name}`);

//   const product102: Product = new Product();
//   product102.name = "Kingston Fury Beast 32GB DDR5-6000";
//   product102.price = 4590000;
//   product102.description = "Kingston Fury Beast 32GB (2x16GB) DDR5-6000MHz";
//   product102.stock = 20;
//   product102.category = ramCategory;
//   await product102.save();
//   savedProducts.push(product102);
//   console.log(`Added product: ${product102.name}`);

//   const product103: Product = new Product();
//   product103.name = "TeamGroup T-Force Delta RGB 32GB DDR5-6400";
//   product103.price = 5690000;
//   product103.description = "TeamGroup T-Force Delta RGB 32GB (2x16GB) DDR5-6400MHz";
//   product103.stock = 12;
//   product103.category = ramCategory;
//   await product103.save();
//   savedProducts.push(product103);
//   console.log(`Added product: ${product103.name}`);

//   const product104: Product = new Product();
//   product104.name = "Crucial Pro 32GB DDR5-5600";
//   product104.price = 3990000;
//   product104.description = "Crucial Pro 32GB (2x16GB) DDR5-5600MHz";
//   product104.stock = 16;
//   product104.category = ramCategory;
//   await product104.save();
//   savedProducts.push(product104);
//   console.log(`Added product: ${product104.name}`);

//   const product105: Product = new Product();
//   product105.name = "Patriot Viper Venom 32GB DDR5-6200";
//   product105.price = 4890000;
//   product105.description = "Patriot Viper Venom 32GB (2x16GB) DDR5-6200MHz";
//   product105.stock = 10;
//   product105.category = ramCategory;
//   await product105.save();
//   savedProducts.push(product105);
//   console.log(`Added product: ${product105.name}`);

//   const product106: Product = new Product();
//   product106.name = "ADATA XPG Lancer RGB 32GB DDR5-6000";
//   product106.price = 4790000;
//   product106.description = "ADATA XPG Lancer RGB 32GB (2x16GB) DDR5-6000MHz";
//   product106.stock = 14;
//   product106.category = ramCategory;
//   await product106.save();
//   savedProducts.push(product106);
//   console.log(`Added product: ${product106.name}`);

//   const product107: Product = new Product();
//   product107.name = "PNY XLR8 Gaming 32GB DDR5-6000";
//   product107.price = 4690000;
//   product107.description = "PNY XLR8 Gaming 32GB (2x16GB) DDR5-6000MHz";
//   product107.stock = 11;
//   product107.category = ramCategory;
//   await product107.save();
//   savedProducts.push(product107);
//   console.log(`Added product: ${product107.name}`);

//   const product108: Product = new Product();
//   product108.name = "Samsung 32GB DDR5-4800";
//   product108.price = 3590000;
//   product108.description = "Samsung 32GB (2x16GB) DDR5-4800MHz";
//   product108.stock = 22;
//   product108.category = ramCategory;
//   await product108.save();
//   savedProducts.push(product108);
//   console.log(`Added product: ${product108.name}`);

//   const product109: Product = new Product();
//   product109.name = "Lexar ARES RGB 32GB DDR5-5600";
//   product109.price = 4190000;
//   product109.description = "Lexar ARES RGB 32GB (2x16GB) DDR5-5600MHz";
//   product109.stock = 13;
//   product109.category = ramCategory;
//   await product109.save();
//   savedProducts.push(product109);
//   console.log(`Added product: ${product109.name}`);
//   return savedProducts;
// }

// Add new DDR5 RAM components for the new products
// export async function addDetailedDDR5RamComponents() {
//   // 1. Corsair Dominator Platinum RGB 32GB DDR5-6000
//   const product100 = await Product.findOne({
//     where: { name: "Corsair Dominator Platinum RGB 32GB DDR5-6000" },
//     relations: ["category"],
//   });
//   if (product100) {
//     const ram100 = new RAM();
//     ram100.product = product100;
//     ram100.brand = "Corsair";
//     ram100.model = "Dominator Platinum RGB";
//     ram100.capacityGb = 32;
//     ram100.speedMhz = 6000;
//     ram100.type = "DDR5";
//     await ram100.save();
//     console.log(`Added RAM component for: ${product100.name}`);
//   }

//   // 2. G.Skill Ripjaws S5 32GB DDR5-5600
//   const product101 = await Product.findOne({
//     where: { name: "G.Skill Ripjaws S5 32GB DDR5-5600" },
//     relations: ["category"],
//   });
//   if (product101) {
//     const ram101 = new RAM();
//     ram101.product = product101;
//     ram101.brand = "G.Skill";
//     ram101.model = "Ripjaws S5";
//     ram101.capacityGb = 32;
//     ram101.speedMhz = 5600;
//     ram101.type = "DDR5";
//     await ram101.save();
//     console.log(`Added RAM component for: ${product101.name}`);
//   }

//   // 3. Kingston Fury Beast 32GB DDR5-6000
//   const product102 = await Product.findOne({
//     where: { name: "Kingston Fury Beast 32GB DDR5-6000" },
//     relations: ["category"],
//   });
//   if (product102) {
//     const ram102 = new RAM();
//     ram102.product = product102;
//     ram102.brand = "Kingston";
//     ram102.model = "Fury Beast";
//     ram102.capacityGb = 32;
//     ram102.speedMhz = 6000;
//     ram102.type = "DDR5";
//     await ram102.save();
//     console.log(`Added RAM component for: ${product102.name}`);
//   }

//   // 4. TeamGroup T-Force Delta RGB 32GB DDR5-6400
//   const product103 = await Product.findOne({
//     where: { name: "TeamGroup T-Force Delta RGB 32GB DDR5-6400" },
//     relations: ["category"],
//   });
//   if (product103) {
//     const ram103 = new RAM();
//     ram103.product = product103;
//     ram103.brand = "TeamGroup";
//     ram103.model = "T-Force Delta RGB";
//     ram103.capacityGb = 32;
//     ram103.speedMhz = 6400;
//     ram103.type = "DDR5";
//     await ram103.save();
//     console.log(`Added RAM component for: ${product103.name}`);
//   }

//   // 5. Crucial Pro 32GB DDR5-5600
//   const product104 = await Product.findOne({
//     where: { name: "Crucial Pro 32GB DDR5-5600" },
//     relations: ["category"],
//   });
//   if (product104) {
//     const ram104 = new RAM();
//     ram104.product = product104;
//     ram104.brand = "Crucial";
//     ram104.model = "Pro";
//     ram104.capacityGb = 32;
//     ram104.speedMhz = 5600;
//     ram104.type = "DDR5";
//     await ram104.save();
//     console.log(`Added RAM component for: ${product104.name}`);
//   }

//   // 6. Patriot Viper Venom 32GB DDR5-6200
//   const product105 = await Product.findOne({
//     where: { name: "Patriot Viper Venom 32GB DDR5-6200" },
//     relations: ["category"],
//   });
//   if (product105) {
//     const ram105 = new RAM();
//     ram105.product = product105;
//     ram105.brand = "Patriot";
//     ram105.model = "Viper Venom";
//     ram105.capacityGb = 32;
//     ram105.speedMhz = 6200;
//     ram105.type = "DDR5";
//     await ram105.save();
//     console.log(`Added RAM component for: ${product105.name}`);
//   }

//   // 7. ADATA XPG Lancer RGB 32GB DDR5-6000
//   const product106 = await Product.findOne({
//     where: { name: "ADATA XPG Lancer RGB 32GB DDR5-6000" },
//     relations: ["category"],
//   });
//   if (product106) {
//     const ram106 = new RAM();
//     ram106.product = product106;
//     ram106.brand = "ADATA";
//     ram106.model = "XPG Lancer RGB";
//     ram106.capacityGb = 32;
//     ram106.speedMhz = 6000;
//     ram106.type = "DDR5";
//     await ram106.save();
//     console.log(`Added RAM component for: ${product106.name}`);
//   }

//   // 8. PNY XLR8 Gaming 32GB DDR5-6000
//   const product107 = await Product.findOne({
//     where: { name: "PNY XLR8 Gaming 32GB DDR5-6000" },
//     relations: ["category"],
//   });
//   if (product107) {
//     const ram107 = new RAM();
//     ram107.product = product107;
//     ram107.brand = "PNY";
//     ram107.model = "XLR8 Gaming";
//     ram107.capacityGb = 32;
//     ram107.speedMhz = 6000;
//     ram107.type = "DDR5";
//     await ram107.save();
//     console.log(`Added RAM component for: ${product107.name}`);
//   }

//   // 9. Samsung 32GB DDR5-4800
//   const product108 = await Product.findOne({
//     where: { name: "Samsung 32GB DDR5-4800" },
//     relations: ["category"],
//   });
//   if (product108) {
//     const ram108 = new RAM();
//     ram108.product = product108;
//     ram108.brand = "Samsung";
//     ram108.model = "DDR5-4800";
//     ram108.capacityGb = 32;
//     ram108.speedMhz = 4800;
//     ram108.type = "DDR5";
//     await ram108.save();
//     console.log(`Added RAM component for: ${product108.name}`);
//   }

//   // 10. Lexar ARES RGB 32GB DDR5-5600
//   const product109 = await Product.findOne({
//     where: { name: "Lexar ARES RGB 32GB DDR5-5600" },
//     relations: ["category"],
//   });
//   if (product109) {
//     const ram109 = new RAM();
//     ram109.product = product109;
//     ram109.brand = "Lexar";
//     ram109.model = "ARES RGB";
//     ram109.capacityGb = 32;
//     ram109.speedMhz = 5600;
//     ram109.type = "DDR5";
//     await ram109.save();
//     console.log(`Added RAM component for: ${product109.name}`);
//   }
//   console.log("Successfully added all detailed DDR5 RAM components.");
// }

// Add sample products and components for each type in Laptop.md
// export async function addSampleProductsFromLaptopMd() {
//   // 1. Laptop
//   const laptopCategory = await Category.findOne({ where: { slug: "laptop" } });
//   if (laptopCategory) {
//     const laptopProduct = new Product();
//     laptopProduct.name = "ASUS ROG Zephyrus G14";
//     laptopProduct.price = 34990000;
//     laptopProduct.description =
//       "ASUS ROG Zephyrus G14 Gaming Laptop with AMD Ryzen 9 and RTX 4060";
//     laptopProduct.stock = 5;
//     laptopProduct.category = laptopCategory;
//     await laptopProduct.save();
//     const laptop = new Laptop();
//     laptop.product = laptopProduct;
//     laptop.brand = "Asus";
//     laptop.model = "ROG Zephyrus G14";
//     laptop.screenSize = 14.0;
//     laptop.screenType = "IPS";
//     laptop.resolution = "2560x1600";
//     laptop.batteryLifeHours = 8.0;
//     laptop.weightKg = 1.7;
//     laptop.os = "Windows 11";
//     laptop.ramCount = 2;
//     await laptop.save();
//     console.log(`Added Laptop: ${laptopProduct.name}`);
//   }

//   // 2. RAM
//   const ramCategory = await Category.findOne({ where: { slug: "ram" } });
//   if (ramCategory) {
//     const ramProduct = new Product();
//     ramProduct.name = "G.Skill Trident Z5 RGB 32GB DDR5-6000";
//     ramProduct.price = 3990000;
//     ramProduct.description =
//       "G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000MHz";
//     ramProduct.stock = 10;
//     ramProduct.category = ramCategory;
//     await ramProduct.save();
//     const ram = new RAM();
//     ram.product = ramProduct;
//     ram.brand = "G.Skill";
//     ram.model = "Trident Z5 RGB";
//     ram.capacityGb = 32;
//     ram.speedMhz = 6000;
//     ram.type = "DDR5";
//     await ram.save();
//     console.log(`Added RAM: ${ramProduct.name}`);
//   }

//   // 3. CPU
//   const cpuCategory = await Category.findOne({ where: { slug: "cpu" } });
//   if (cpuCategory) {
//     const cpuProduct = new Product();
//     cpuProduct.name = "Intel Core i7-13700K";
//     cpuProduct.price = 11990000;
//     cpuProduct.description =
//       "Intel Core i7-13700K 16-Core Processor with Intel UHD Graphics 770";
//     cpuProduct.stock = 8;
//     cpuProduct.category = cpuCategory;
//     await cpuProduct.save();
//     const cpu = new CPU();
//     cpu.product = cpuProduct;
//     cpu.cores = 16;
//     cpu.threads = 24;
//     cpu.baseClock = "3.4 GHz";
//     cpu.boostClock = "5.4 GHz";
//     cpu.socket = "LGA 1700";
//     cpu.architecture = "Raptor Lake";
//     cpu.tdp = 253;
//     cpu.integratedGraphics = "Intel UHD Graphics 770";
//     await cpu.save();
//     console.log(`Added CPU: ${cpuProduct.name}`);
//   }

//   // 4. GPU
//   const gpuCategory = await Category.findOne({ where: { slug: "gpu" } });
//   if (gpuCategory) {
//     const gpuProduct = new Product();
//     gpuProduct.name = "NVIDIA GeForce RTX 4070 Ti";
//     gpuProduct.price = 22990000;
//     gpuProduct.description =
//       "NVIDIA GeForce RTX 4070 Ti 12GB GDDR6X Graphics Card";
//     gpuProduct.stock = 6;
//     gpuProduct.category = gpuCategory;
//     await gpuProduct.save();
//     const gpu = new GPU();
//     gpu.product = gpuProduct;
//     gpu.brand = "NVIDIA";
//     gpu.model = "GeForce RTX 4070 Ti";
//     gpu.vram = 12;
//     gpu.chipset = "AD104";
//     gpu.memoryType = "GDDR6X";
//     gpu.lengthMm = 285;
//     gpu.tdp = 285;
//     await gpu.save();
//     console.log(`Added GPU: ${gpuProduct.name}`);
//   }

//   // 5. Monitor
//   const monitorCategory = await Category.findOne({
//     where: { slug: "monitor" },
//   });
//   if (monitorCategory) {
//     const monitorProduct = new Product();
//     monitorProduct.name = "LG UltraGear 27GP850-B";
//     monitorProduct.price = 8990000;
//     monitorProduct.description =
//       "LG UltraGear 27GP850-B 27-inch 1440p 165Hz Gaming Monitor";
//     monitorProduct.stock = 7;
//     monitorProduct.category = monitorCategory;
//     await monitorProduct.save();
//     const monitor = new Monitor();
//     monitor.product = monitorProduct;
//     monitor.brand = "LG";
//     monitor.model = "27GP850-B";
//     monitor.sizeInch = 27.0;
//     monitor.resolution = "2560x1440";
//     monitor.refreshRate = 165;
//     monitor.panelType = "IPS";
//     await monitor.save();
//     console.log(`Added Monitor: ${monitorProduct.name}`);
//   }

//   // 6. Motherboard
//   const motherboardCategory = await Category.findOne({
//     where: { slug: "motherboard" },
//   });
//   if (motherboardCategory) {
//     const mbProduct = new Product();
//     mbProduct.name = "ASUS ROG Strix Z690-A";
//     mbProduct.price = 7990000;
//     mbProduct.description =
//       "ASUS ROG Strix Z690-A Gaming WiFi D4 ATX Motherboard";
//     mbProduct.stock = 9;
//     mbProduct.category = motherboardCategory;
//     await mbProduct.save();
//     const mb = new Motherboard();
//     mb.product = mbProduct;
//     mb.brand = "ASUS";
//     mb.model = "ROG Strix Z690-A";
//     mb.chipset = "Intel Z690";
//     mb.socket = "LGA 1700";
//     mb.formFactor = "ATX";
//     mb.ramSlots = 4;
//     mb.maxRam = 128;
//     mb.ramType = "DDR4";
//     await mb.save();
//     console.log(`Added Motherboard: ${mbProduct.name}`);
//   }

//   // 7. PSU
//   const psuCategory = await Category.findOne({ where: { slug: "psu" } });
//   if (psuCategory) {
//     const psuProduct = new Product();
//     psuProduct.name = "Corsair RM850x 850W 80+ Gold";
//     psuProduct.price = 3990000;
//     psuProduct.description = "Corsair RM850x 850W 80+ Gold Fully Modular PSU";
//     psuProduct.stock = 10;
//     psuProduct.category = psuCategory;
//     await psuProduct.save();
//     const psu = new PSU();
//     psu.product = psuProduct;
//     psu.brand = "Corsair";
//     psu.model = "RM850x";
//     psu.wattage = 850;
//     psu.efficiencyRating = "80+ Gold";
//     psu.modular = "Fully Modular";
//     await psu.save();
//     console.log(`Added PSU: ${psuProduct.name}`);
//   }

//   // 8. Drive
//   const driveCategory = await Category.findOne({ where: { slug: "drive" } });
//   if (driveCategory) {
//     const driveProduct = new Product();
//     driveProduct.name = "Samsung 980 PRO 1TB NVMe SSD";
//     driveProduct.price = 2990000;
//     driveProduct.description = "Samsung 980 PRO 1TB NVMe PCIe Gen4 SSD";
//     driveProduct.stock = 12;
//     driveProduct.category = driveCategory;
//     await driveProduct.save();
//     const drive = new Drive();
//     drive.product = driveProduct;
//     drive.brand = "Samsung";
//     drive.model = "980 PRO";
//     drive.type = "SSD";
//     drive.capacityGb = 1000;
//     drive.interface = "NVMe M.2";
//     await drive.save();
//     console.log(`Added Drive: ${driveProduct.name}`);
//   }

//   // 9. Cooler
//   const coolerCategory = await Category.findOne({ where: { slug: "cooler" } });
//   if (coolerCategory) {
//     const coolerProduct = new Product();
//     coolerProduct.name = "Noctua NH-D15";
//     coolerProduct.price = 2490000;
//     coolerProduct.description = "Noctua NH-D15 Premium CPU Air Cooler";
//     coolerProduct.stock = 8;
//     coolerProduct.category = coolerCategory;
//     await coolerProduct.save();
//     const cooler = new Cooler();
//     cooler.product = coolerProduct;
//     cooler.brand = "Noctua";
//     cooler.model = "NH-D15";
//     cooler.type = "Air";
//     cooler.supportedSockets = "LGA 1700, AM4, AM5";
//     cooler.fanSizeMm = 140;
//     await cooler.save();
//     console.log(`Added Cooler: ${coolerProduct.name}`);
//   }

//   // 10. Case
//   const caseCategory = await Category.findOne({ where: { slug: "case" } });
//   if (caseCategory) {
//     const caseProduct = new Product();
//     caseProduct.name = "NZXT H510 Elite";
//     caseProduct.price = 3990000;
//     caseProduct.description =
//       "NZXT H510 Elite Mid-Tower ATX Case with Tempered Glass";
//     caseProduct.stock = 7;
//     caseProduct.category = caseCategory;
//     await caseProduct.save();
//     const caseComponent = new Case();
//     caseComponent.product = caseProduct;
//     caseComponent.brand = "NZXT";
//     caseComponent.model = "H510 Elite";
//     caseComponent.formFactorSupport = "ATX, mATX, ITX";
//     caseComponent.hasRgb = true;
//     caseComponent.sidePanelType = "Tempered Glass";
//     caseComponent.maxGpuLengthMm = 381;
//     caseComponent.psuType = "ATX";
//     await caseComponent.save();
//     console.log(`Added Case: ${caseProduct.name}`);
//   }

//   console.log(
//     "Successfully added sample products and components from Laptop.md"
//   );
// }

// // Add more popularized sample products and components for each type in Laptop.md
// export async function addPopularizedSampleProductsFromLaptopMd() {
//   // Laptops
//   const laptopCategory = await Category.findOne({ where: { slug: "laptop" } });
//   if (laptopCategory) {
//     const laptops = [
//       {
//         name: "Dell XPS 13 Plus",
//         price: 32990000,
//         description: "Dell XPS 13 Plus Ultrabook with Intel Core i7",
//         stock: 8,
//         brand: "Dell",
//         model: "XPS 13 Plus",
//         screenSize: 13.4,
//         screenType: "OLED",
//         resolution: "3456x2160",
//         batteryLifeHours: 10.0,
//         weightKg: 1.2,
//         os: "Windows 11",
//         ramCount: 2,
//       },
//       {
//         name: "MacBook Pro 16-inch M3",
//         price: 59990000,
//         description: "Apple MacBook Pro 16-inch with M3 Pro chip",
//         stock: 5,
//         brand: "Apple",
//         model: "MacBook Pro 16-inch M3",
//         screenSize: 16.2,
//         screenType: "Liquid Retina XDR",
//         resolution: "3456x2234",
//         batteryLifeHours: 18.0,
//         weightKg: 2.1,
//         os: "macOS",
//         ramCount: 1,
//       },
//       {
//         name: "HP Spectre x360 14",
//         price: 28990000,
//         description: "HP Spectre x360 14 2-in-1 Laptop with Intel Core i7",
//         stock: 7,
//         brand: "HP",
//         model: "Spectre x360 14",
//         screenSize: 13.5,
//         screenType: "IPS Touch",
//         resolution: "1920x1280",
//         batteryLifeHours: 11.0,
//         weightKg: 1.3,
//         os: "Windows 11",
//         ramCount: 2,
//       },
//     ];
//     for (const l of laptops) {
//       if (!(await Product.findOne({ where: { name: l.name } }))) {
//         const laptopProduct = new Product();
//         laptopProduct.name = l.name;
//         laptopProduct.price = l.price;
//         laptopProduct.description = l.description;
//         laptopProduct.stock = l.stock;
//         laptopProduct.category = laptopCategory;
//         await laptopProduct.save();
//         const laptop = new Laptop();
//         laptop.product = laptopProduct;
//         laptop.brand = l.brand;
//         laptop.model = l.model;
//         laptop.screenSize = l.screenSize;
//         laptop.screenType = l.screenType;
//         laptop.resolution = l.resolution;
//         laptop.batteryLifeHours = l.batteryLifeHours;
//         laptop.weightKg = l.weightKg;
//         laptop.os = l.os;
//         laptop.ramCount = l.ramCount;
//         await laptop.save();
//         console.log(`Added Laptop: ${laptopProduct.name}`);
//       }
//     }
//   }

//   // RAM
//   const ramCategory = await Category.findOne({ where: { slug: "ram" } });
//   if (ramCategory) {
//     const rams = [
//       {
//         name: "Corsair Vengeance 16GB DDR4-3200",
//         price: 1590000,
//         description: "Corsair Vengeance 16GB (2x8GB) DDR4-3200MHz",
//         stock: 20,
//         brand: "Corsair",
//         model: "Vengeance",
//         capacityGb: 16,
//         speedMhz: 3200,
//         type: "DDR4",
//       },
//       {
//         name: "Kingston Fury Beast 32GB DDR5-5600",
//         price: 3690000,
//         description: "Kingston Fury Beast 32GB (2x16GB) DDR5-5600MHz",
//         stock: 15,
//         brand: "Kingston",
//         model: "Fury Beast",
//         capacityGb: 32,
//         speedMhz: 5600,
//         type: "DDR5",
//       },
//       {
//         name: "TeamGroup T-Force Delta RGB 16GB DDR4-3200",
//         price: 1290000,
//         description: "TeamGroup T-Force Delta RGB 16GB (2x8GB) DDR4-3200MHz",
//         stock: 18,
//         brand: "TeamGroup",
//         model: "T-Force Delta RGB",
//         capacityGb: 16,
//         speedMhz: 3200,
//         type: "DDR4",
//       },
//       {
//         name: "Crucial Ballistix 32GB DDR4-3600",
//         price: 1990000,
//         description: "Crucial Ballistix 32GB (2x16GB) DDR4-3600MHz",
//         stock: 12,
//         brand: "Crucial",
//         model: "Ballistix",
//         capacityGb: 32,
//         speedMhz: 3600,
//         type: "DDR4",
//       },
//     ];
//     for (const r of rams) {
//       if (!(await Product.findOne({ where: { name: r.name } }))) {
//         const ramProduct = new Product();
//         ramProduct.name = r.name;
//         ramProduct.price = r.price;
//         ramProduct.description = r.description;
//         ramProduct.stock = r.stock;
//         ramProduct.category = ramCategory;
//         await ramProduct.save();
//         const ram = new RAM();
//         ram.product = ramProduct;
//         ram.brand = r.brand;
//         ram.model = r.model;
//         ram.capacityGb = r.capacityGb;
//         ram.speedMhz = r.speedMhz;
//         ram.type = r.type;
//         await ram.save();
//         console.log(`Added RAM: ${ramProduct.name}`);
//       }
//     }
//   }

//   // CPU
//   const cpuCategory = await Category.findOne({ where: { slug: "cpu" } });
//   if (cpuCategory) {
//     const cpus = [
//       {
//         name: "AMD Ryzen 7 5800X",
//         price: 7990000,
//         description: "AMD Ryzen 7 5800X 8-Core Processor",
//         stock: 10,
//         cores: 8,
//         threads: 16,
//         baseClock: "3.8 GHz",
//         boostClock: "4.7 GHz",
//         socket: "AM4",
//         architecture: "Zen 3",
//         tdp: 105,
//         integratedGraphics: "",
//       },
//       {
//         name: "Intel Core i5-12400F",
//         price: 4990000,
//         description: "Intel Core i5-12400F 6-Core Processor",
//         stock: 12,
//         cores: 6,
//         threads: 12,
//         baseClock: "2.5 GHz",
//         boostClock: "4.4 GHz",
//         socket: "LGA 1700",
//         architecture: "Alder Lake",
//         tdp: 65,
//         integratedGraphics: "",
//       },
//       {
//         name: "Intel Core i9-13900K",
//         price: 15990000,
//         description:
//           "Intel Core i9-13900K 24-Core Processor with Intel UHD Graphics 770",
//         stock: 6,
//         cores: 24,
//         threads: 32,
//         baseClock: "3.0 GHz",
//         boostClock: "5.8 GHz",
//         socket: "LGA 1700",
//         architecture: "Raptor Lake",
//         tdp: 253,
//         integratedGraphics: "Intel UHD Graphics 770",
//       },
//       {
//         name: "AMD Ryzen 5 5600X",
//         price: 3990000,
//         description: "AMD Ryzen 5 5600X 6-Core Processor",
//         stock: 10,
//         cores: 6,
//         threads: 12,
//         baseClock: "3.7 GHz",
//         boostClock: "4.6 GHz",
//         socket: "AM4",
//         architecture: "Zen 3",
//         tdp: 65,
//         integratedGraphics: "",
//       },
//     ];
//     for (const c of cpus) {
//       if (!(await Product.findOne({ where: { name: c.name } }))) {
//         const cpuProduct = new Product();
//         cpuProduct.name = c.name;
//         cpuProduct.price = c.price;
//         cpuProduct.description = c.description;
//         cpuProduct.stock = c.stock;
//         cpuProduct.category = cpuCategory;
//         await cpuProduct.save();
//         const cpu = new CPU();
//         cpu.product = cpuProduct;
//         cpu.cores = c.cores;
//         cpu.threads = c.threads;
//         cpu.baseClock = c.baseClock;
//         cpu.boostClock = c.boostClock;
//         cpu.socket = c.socket;
//         cpu.architecture = c.architecture;
//         cpu.tdp = c.tdp;
//         cpu.integratedGraphics = c.integratedGraphics;
//         await cpu.save();
//         console.log(`Added CPU: ${cpuProduct.name}`);
//       }
//     }
//   }

//   // GPU
//   const gpuCategory = await Category.findOne({ where: { slug: "gpu" } });
//   if (gpuCategory) {
//     const gpus = [
//       {
//         name: "AMD Radeon RX 7900 XTX",
//         price: 29990000,
//         description: "AMD Radeon RX 7900 XTX 24GB GDDR6 Graphics Card",
//         stock: 7,
//         brand: "AMD",
//         model: "Radeon RX 7900 XTX",
//         vram: 24,
//         chipset: "Navi 31",
//         memoryType: "GDDR6",
//         lengthMm: 287,
//         tdp: 355,
//       },
//       {
//         name: "NVIDIA GeForce RTX 4060 Ti",
//         price: 15990000,
//         description: "NVIDIA GeForce RTX 4060 Ti 8GB GDDR6 Graphics Card",
//         stock: 8,
//         brand: "NVIDIA",
//         model: "GeForce RTX 4060 Ti",
//         vram: 8,
//         chipset: "AD106",
//         memoryType: "GDDR6",
//         lengthMm: 242,
//         tdp: 160,
//       },
//       {
//         name: "AMD Radeon RX 6700 XT",
//         price: 11990000,
//         description: "AMD Radeon RX 6700 XT 12GB GDDR6 Graphics Card",
//         stock: 10,
//         brand: "AMD",
//         model: "Radeon RX 6700 XT",
//         vram: 12,
//         chipset: "Navi 22",
//         memoryType: "GDDR6",
//         lengthMm: 267,
//         tdp: 230,
//       },
//     ];
//     for (const g of gpus) {
//       if (!(await Product.findOne({ where: { name: g.name } }))) {
//         const gpuProduct = new Product();
//         gpuProduct.name = g.name;
//         gpuProduct.price = g.price;
//         gpuProduct.description = g.description;
//         gpuProduct.stock = g.stock;
//         gpuProduct.category = gpuCategory;
//         await gpuProduct.save();
//         const gpu = new GPU();
//         gpu.product = gpuProduct;
//         gpu.brand = g.brand;
//         gpu.model = g.model;
//         gpu.vram = g.vram;
//         gpu.chipset = g.chipset;
//         gpu.memoryType = g.memoryType;
//         gpu.lengthMm = g.lengthMm;
//         gpu.tdp = g.tdp;
//         await gpu.save();
//         console.log(`Added GPU: ${gpuProduct.name}`);
//       }
//     }
//   }

//   // Monitor
//   const monitorCategory = await Category.findOne({
//     where: { slug: "monitor" },
//   });
//   if (monitorCategory) {
//     const monitors = [
//       {
//         name: "Samsung Odyssey G7",
//         price: 15990000,
//         description: "Samsung Odyssey G7 32-inch 240Hz QHD Gaming Monitor",
//         stock: 6,
//         brand: "Samsung",
//         model: "Odyssey G7",
//         sizeInch: 32.0,
//         resolution: "2560x1440",
//         refreshRate: 240,
//         panelType: "VA",
//       },
//       {
//         name: "ASUS ROG Swift PG279Q",
//         price: 12990000,
//         description: "ASUS ROG Swift PG279Q 27-inch 1440p 165Hz Gaming Monitor",
//         stock: 5,
//         brand: "ASUS",
//         model: "ROG Swift PG279Q",
//         sizeInch: 27.0,
//         resolution: "2560x1440",
//         refreshRate: 165,
//         panelType: "IPS",
//       },
//       {
//         name: "AOC CU34G2X",
//         price: 8990000,
//         description: "AOC CU34G2X 34-inch Ultrawide Gaming Monitor",
//         stock: 6,
//         brand: "AOC",
//         model: "CU34G2X",
//         sizeInch: 34.0,
//         resolution: "3440x1440",
//         refreshRate: 144,
//         panelType: "VA",
//       },
//     ];
//     for (const m of monitors) {
//       if (!(await Product.findOne({ where: { name: m.name } }))) {
//         const monitorProduct = new Product();
//         monitorProduct.name = m.name;
//         monitorProduct.price = m.price;
//         monitorProduct.description = m.description;
//         monitorProduct.stock = m.stock;
//         monitorProduct.category = monitorCategory;
//         await monitorProduct.save();
//         const monitor = new Monitor();
//         monitor.product = monitorProduct;
//         monitor.brand = m.brand;
//         monitor.model = m.model;
//         monitor.sizeInch = m.sizeInch;
//         monitor.resolution = m.resolution;
//         monitor.refreshRate = m.refreshRate;
//         monitor.panelType = m.panelType;
//         await monitor.save();
//         console.log(`Added Monitor: ${monitorProduct.name}`);
//       }
//     }
//   }

//   // Motherboard
//   const motherboardCategory = await Category.findOne({
//     where: { slug: "motherboard" },
//   });
//   if (motherboardCategory) {
//     const motherboards = [
//       {
//         name: "MSI MPG B650 Carbon WiFi",
//         price: 5990000,
//         description: "MSI MPG B650 Carbon WiFi AMD B650 ATX Motherboard",
//         stock: 10,
//         brand: "MSI",
//         model: "MPG B650 Carbon WiFi",
//         chipset: "AMD B650",
//         socket: "AM5",
//         formFactor: "ATX",
//         ramSlots: 4,
//         maxRam: 128,
//         ramType: "DDR5",
//       },
//       {
//         name: "ASUS TUF Gaming B760M-Plus WiFi",
//         price: 4490000,
//         description:
//           "ASUS TUF Gaming B760M-Plus WiFi Intel B760 mATX Motherboard",
//         stock: 8,
//         brand: "ASUS",
//         model: "TUF Gaming B760M-Plus WiFi",
//         chipset: "Intel B760",
//         socket: "LGA 1700",
//         formFactor: "mATX",
//         ramSlots: 4,
//         maxRam: 128,
//         ramType: "DDR4",
//       },
//       {
//         name: "Gigabyte B760 Aorus Elite",
//         price: 4990000,
//         description: "Gigabyte B760 Aorus Elite Intel B760 ATX Motherboard",
//         stock: 7,
//         brand: "Gigabyte",
//         model: "B760 Aorus Elite",
//         chipset: "Intel B760",
//         socket: "LGA 1700",
//         formFactor: "ATX",
//         ramSlots: 4,
//         maxRam: 128,
//         ramType: "DDR4",
//       },
//     ];
//     for (const mb of motherboards) {
//       if (!(await Product.findOne({ where: { name: mb.name } }))) {
//         const mbProduct = new Product();
//         mbProduct.name = mb.name;
//         mbProduct.price = mb.price;
//         mbProduct.description = mb.description;
//         mbProduct.stock = mb.stock;
//         mbProduct.category = motherboardCategory;
//         await mbProduct.save();
//         const motherboard = new Motherboard();
//         motherboard.product = mbProduct;
//         motherboard.brand = mb.brand;
//         motherboard.model = mb.model;
//         motherboard.chipset = mb.chipset;
//         motherboard.socket = mb.socket;
//         motherboard.formFactor = mb.formFactor;
//         motherboard.ramSlots = mb.ramSlots;
//         motherboard.maxRam = mb.maxRam;
//         motherboard.ramType = mb.ramType;
//         await motherboard.save();
//         console.log(`Added Motherboard: ${mbProduct.name}`);
//       }
//     }
//   }

//   // PSU
//   const psuCategory = await Category.findOne({ where: { slug: "psu" } });
//   if (psuCategory) {
//     const psus = [
//       {
//         name: "Seasonic Focus GX-750",
//         price: 2990000,
//         description: "Seasonic Focus GX-750 750W 80+ Gold Fully Modular PSU",
//         stock: 8,
//         brand: "Seasonic",
//         model: "Focus GX-750",
//         wattage: 750,
//         efficiencyRating: "80+ Gold",
//         modular: "Fully Modular",
//       },
//       {
//         name: "Corsair RM1000x 1000W 80+ Gold",
//         price: 4990000,
//         description: "Corsair RM1000x 1000W 80+ Gold Fully Modular PSU",
//         stock: 6,
//         brand: "Corsair",
//         model: "RM1000x",
//         wattage: 1000,
//         efficiencyRating: "80+ Gold",
//         modular: "Fully Modular",
//       },
//       {
//         name: "EVGA SuperNOVA 850 G5",
//         price: 3990000,
//         description: "EVGA SuperNOVA 850 G5 850W 80+ Gold Fully Modular PSU",
//         stock: 7,
//         brand: "EVGA",
//         model: "SuperNOVA 850 G5",
//         wattage: 850,
//         efficiencyRating: "80+ Gold",
//         modular: "Fully Modular",
//       },
//     ];
//     for (const p of psus) {
//       if (!(await Product.findOne({ where: { name: p.name } }))) {
//         const psuProduct = new Product();
//         psuProduct.name = p.name;
//         psuProduct.price = p.price;
//         psuProduct.description = p.description;
//         psuProduct.stock = p.stock;
//         psuProduct.category = psuCategory;
//         await psuProduct.save();
//         const psu = new PSU();
//         psu.product = psuProduct;
//         psu.brand = p.brand;
//         psu.model = p.model;
//         psu.wattage = p.wattage;
//         psu.efficiencyRating = p.efficiencyRating;
//         psu.modular = p.modular;
//         await psu.save();
//         console.log(`Added PSU: ${psuProduct.name}`);
//       }
//     }
//   }

//   // Drive
//   const driveCategory = await Category.findOne({ where: { slug: "drive" } });
//   if (driveCategory) {
//     const drives = [
//       {
//         name: "WD Black SN850X 2TB",
//         price: 5990000,
//         description: "WD Black SN850X 2TB NVMe M.2 SSD",
//         stock: 9,
//         brand: "Western Digital",
//         model: "Black SN850X",
//         type: "SSD",
//         capacityGb: 2000,
//         interface: "NVMe M.2",
//       },
//       {
//         name: "Samsung 970 EVO Plus 1TB",
//         price: 2990000,
//         description: "Samsung 970 EVO Plus 1TB NVMe M.2 SSD",
//         stock: 10,
//         brand: "Samsung",
//         model: "970 EVO Plus",
//         type: "SSD",
//         capacityGb: 1000,
//         interface: "NVMe M.2",
//       },
//       {
//         name: "Crucial P5 Plus 2TB",
//         price: 5990000,
//         description: "Crucial P5 Plus 2TB NVMe M.2 SSD",
//         stock: 7,
//         brand: "Crucial",
//         model: "P5 Plus",
//         type: "SSD",
//         capacityGb: 2000,
//         interface: "NVMe M.2",
//       },
//     ];
//     for (const d of drives) {
//       if (!(await Product.findOne({ where: { name: d.name } }))) {
//         const driveProduct = new Product();
//         driveProduct.name = d.name;
//         driveProduct.price = d.price;
//         driveProduct.description = d.description;
//         driveProduct.stock = d.stock;
//         driveProduct.category = driveCategory;
//         await driveProduct.save();
//         const drive = new Drive();
//         drive.product = driveProduct;
//         drive.brand = d.brand;
//         drive.model = d.model;
//         drive.type = d.type;
//         drive.capacityGb = d.capacityGb;
//         drive.interface = d.interface;
//         await drive.save();
//         console.log(`Added Drive: ${driveProduct.name}`);
//       }
//     }
//   }

//   // Cooler
//   const coolerCategory = await Category.findOne({ where: { slug: "cooler" } });
//   if (coolerCategory) {
//     const coolers = [
//       {
//         name: "Noctua NH-D15",
//         price: 2490000,
//         description: "Noctua NH-D15 Premium CPU Air Cooler",
//         stock: 8,
//         brand: "Noctua",
//         model: "NH-D15",
//         type: "Air",
//         supportedSockets: "LGA 1700, AM4, AM5",
//         fanSizeMm: 140,
//       },
//       {
//         name: "Noctua NH-U12S",
//         price: 1890000,
//         description: "Noctua NH-U12S Premium CPU Air Cooler",
//         stock: 8,
//         brand: "Noctua",
//         model: "NH-U12S",
//         type: "Air",
//         supportedSockets: "LGA 1700, AM4, AM5",
//         fanSizeMm: 120,
//       },
//       {
//         name: "be quiet! Dark Rock Pro 4",
//         price: 2490000,
//         description: "be quiet! Dark Rock Pro 4 Premium CPU Air Cooler",
//         stock: 7,
//         brand: "be quiet!",
//         model: "Dark Rock Pro 4",
//         type: "Air",
//         supportedSockets: "LGA 1700, AM4, AM5",
//         fanSizeMm: 120,
//       },
//     ];
//     for (const c of coolers) {
//       if (!(await Product.findOne({ where: { name: c.name } }))) {
//         const coolerProduct = new Product();
//         coolerProduct.name = c.name;
//         coolerProduct.price = c.price;
//         coolerProduct.description = c.description;
//         coolerProduct.stock = c.stock;
//         coolerProduct.category = coolerCategory;
//         await coolerProduct.save();
//         const cooler = new Cooler();
//         cooler.product = coolerProduct;
//         cooler.brand = c.brand;
//         cooler.model = c.model;
//         cooler.type = c.type;
//         cooler.supportedSockets = c.supportedSockets;
//         cooler.fanSizeMm = c.fanSizeMm;
//         await cooler.save();
//         console.log(`Added Cooler: ${coolerProduct.name}`);
//       }
//     }
//   }

//   // Case
//   const caseCategory = await Category.findOne({ where: { slug: "case" } });
//   if (caseCategory) {
//     const cases = [
//       {
//         name: "NZXT H510 Elite",
//         price: 3990000,
//         description: "NZXT H510 Elite Mid-Tower ATX Case with Tempered Glass",
//         stock: 7,
//         brand: "NZXT",
//         model: "H510 Elite",
//         formFactorSupport: "ATX, mATX, ITX",
//         hasRgb: true,
//         sidePanelType: "Tempered Glass",
//         maxGpuLengthMm: 381,
//         psuType: "ATX",
//       },
//       {
//         name: "Lian Li PC-O11 Dynamic",
//         price: 4990000,
//         description: "Lian Li PC-O11 Dynamic Mid-Tower ATX Case",
//         stock: 8,
//         brand: "Lian Li",
//         model: "PC-O11 Dynamic",
//         formFactorSupport: "ATX, mATX, ITX",
//         hasRgb: false,
//         sidePanelType: "Tempered Glass",
//         maxGpuLengthMm: 420,
//         psuType: "ATX",
//       },
//       {
//         name: "Fractal Design Meshify C",
//         price: 2990000,
//         description: "Fractal Design Meshify C Mid-Tower ATX Case",
//         stock: 10,
//         brand: "Fractal Design",
//         model: "Meshify C",
//         formFactorSupport: "ATX, mATX, ITX",
//         hasRgb: false,
//         sidePanelType: "Tempered Glass",
//         maxGpuLengthMm: 315,
//         psuType: "ATX",
//       },
//       {
//         name: "NZXT H7 Flow",
//         price: 3990000,
//         description: "NZXT H7 Flow Mid-Tower ATX Case",
//         stock: 8,
//         brand: "NZXT",
//         model: "H7 Flow",
//         formFactorSupport: "ATX, mATX, ITX",
//         hasRgb: false,
//         sidePanelType: "Tempered Glass",
//         maxGpuLengthMm: 400,
//         psuType: "ATX",
//       },
//     ];
//     for (const c of cases) {
//       if (!(await Product.findOne({ where: { name: c.name } }))) {
//         const caseProduct = new Product();
//         caseProduct.name = c.name;
//         caseProduct.price = c.price;
//         caseProduct.description = c.description;
//         caseProduct.stock = c.stock;
//         caseProduct.category = caseCategory;
//         await caseProduct.save();
//         const caseComponent = new Case();
//         caseComponent.product = caseProduct;
//         caseComponent.brand = c.brand;
//         caseComponent.model = c.model;
//         caseComponent.formFactorSupport = c.formFactorSupport;
//         caseComponent.hasRgb = c.hasRgb;
//         caseComponent.sidePanelType = c.sidePanelType;
//         caseComponent.maxGpuLengthMm = c.maxGpuLengthMm;
//         caseComponent.psuType = c.psuType;
//         await caseComponent.save();
//         console.log(`Added Case: ${caseProduct.name}`);
//       }
//     }
//   }

//   console.log(
//     "Successfully added popularized sample products and components from Laptop.md"
//   );
// }
