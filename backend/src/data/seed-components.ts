import "reflect-metadata";
import { Product } from "../product/product.entity";
import { Category } from "../product/categories/category.entity";
import { CPU } from "../product/components/cpu.entity";
import { GPU } from "../product/components/gpu.entity";
import { RAM } from "../product/components/ram.entity";
import { Drive } from "../product/components/drive.entity";
import { Motherboard } from "../product/components/motherboard.entity";
import { PSU } from "../product/components/psu.entity";
import { Case } from "../product/components/case.entity";
import { Monitor } from "../product/components/monitor.entity";
import { Mouse } from "../product/components/mouse.entity";
import { Keyboard } from "../product/components/keyboard.entity";
import { Headset } from "../product/components/headset.entity";
import { NetworkCard } from "../product/components/networkCard.entity";
import { Cooler } from "../product/components/cooler.entity";
import { Laptop } from "../product/components/laptop/laptop.entity";
import { PC } from "../product/components/pc.entity";

/**
 * Seed components cho tất cả products theo danh mục
 * Sử dụng logic từ products-script.ts để tạo components dựa trên product names
 */
export async function seedAllComponents(): Promise<void> {
  console.log("🔧 Starting component seeding process...\n");

  try {
    // Lấy tất cả products có category
    const products = await Product.find({
      where: { isActive: true },
      relations: ["category"],
    });

    if (products.length === 0) {
      console.log("⚠️  No products found. Please seed products first.");
      return;
    }

    console.log(`📦 Found ${products.length} active products\n`);

    const savedComponents: any[] = [];

    // CPU Components
    console.log("💻 Step 1: Seeding CPU components...");
    const cpuProducts = products.filter((p) => p.category?.slug === "cpu");
    let cpuCount = 0;
    for (const product of cpuProducts) {
      if (!product.name) continue;

      // Kiểm tra xem đã có component chưa
      const existingCPU = await CPU.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingCPU) {
        console.log(`ℹ️  CPU component already exists for: ${product.name}`);
        continue;
      }

      const cpu = new CPU();
      cpu.product = product;

      // Map product names to CPU specs (từ products-script.ts)
      if (product.name.includes("Intel Core i9-13900K")) {
        cpu.model = "Core i9-13900K";
        cpu.cores = 24;
        cpu.threads = 32;
        cpu.baseClock = "3.0 GHz";
        cpu.boostClock = "5.8 GHz";
        cpu.socket = "LGA 1700";
        cpu.architecture = "Raptor Lake";
        cpu.tdp = 253;
        cpu.integratedGraphics = "Intel UHD Graphics 770";
      } else if (product.name.includes("AMD Ryzen 9 7950X")) {
        cpu.model = "Ryzen 9 7950X";
        cpu.cores = 16;
        cpu.threads = 32;
        cpu.baseClock = "4.5 GHz";
        cpu.boostClock = "5.7 GHz";
        cpu.socket = "AM5";
        cpu.architecture = "Zen 4";
        cpu.tdp = 170;
        cpu.integratedGraphics = "AMD Radeon Graphics";
      } else if (product.name.includes("Intel Core i7-13700K")) {
        cpu.model = "Core i7-13700K";
        cpu.cores = 16;
        cpu.threads = 24;
        cpu.baseClock = "3.4 GHz";
        cpu.boostClock = "5.4 GHz";
        cpu.socket = "LGA 1700";
        cpu.architecture = "Raptor Lake";
        cpu.tdp = 253;
        cpu.integratedGraphics = "Intel UHD Graphics 770";
      } else if (product.name.includes("AMD Ryzen 7 7700X")) {
        cpu.model = "Ryzen 7 7700X";
        cpu.cores = 8;
        cpu.threads = 16;
        cpu.baseClock = "4.5 GHz";
        cpu.boostClock = "5.4 GHz";
        cpu.socket = "AM5";
        cpu.architecture = "Zen 4";
        cpu.tdp = 105;
        cpu.integratedGraphics = "AMD Radeon Graphics";
      } else if (product.name.includes("AMD Ryzen 5 7600X")) {
        cpu.model = "Ryzen 5 7600X";
        cpu.cores = 6;
        cpu.threads = 12;
        cpu.baseClock = "4.7 GHz";
        cpu.boostClock = "5.3 GHz";
        cpu.socket = "AM5";
        cpu.architecture = "Zen 4";
        cpu.tdp = 105;
        cpu.integratedGraphics = "AMD Radeon Graphics";
      } else if (product.name.includes("Intel Core i5-13600K")) {
        cpu.model = "Core i5-13600K";
        cpu.cores = 14;
        cpu.threads = 20;
        cpu.baseClock = "3.5 GHz";
        cpu.boostClock = "5.1 GHz";
        cpu.socket = "LGA 1700";
        cpu.architecture = "Raptor Lake";
        cpu.tdp = 181;
        cpu.integratedGraphics = "Intel UHD Graphics 770";
      } else if (product.name.includes("AMD Ryzen 7 5800X3D")) {
        cpu.model = "Ryzen 7 5800X3D";
        cpu.cores = 8;
        cpu.threads = 16;
        cpu.baseClock = "3.4 GHz";
        cpu.boostClock = "4.5 GHz";
        cpu.socket = "AM4";
        cpu.architecture = "Zen 3";
        cpu.tdp = 105;
        cpu.integratedGraphics = "";
      } else {
        // Default values cho CPU không match
        const nameParts = product.name.split(" ");
        cpu.model = nameParts.slice(-2).join(" ") || product.name;
        cpu.cores = 4;
        cpu.threads = 8;
        cpu.baseClock = "3.0 GHz";
        cpu.boostClock = "4.0 GHz";
        cpu.socket = "Unknown";
        cpu.architecture = "Unknown";
        cpu.tdp = 65;
        cpu.integratedGraphics = "";
        console.log(`⚠️  Using default values for CPU: ${product.name}`);
      }

      await cpu.save();
      savedComponents.push(cpu);
      cpuCount++;
      console.log(`✅ Added CPU component for: ${product.name}`);
    }
    console.log(`✅ CPU components seeded: ${cpuCount} components\n`);

    // GPU Components
    console.log("🎮 Step 2: Seeding GPU components...");
    const gpuProducts = products.filter((p) => p.category?.slug === "gpu");
    let gpuCount = 0;
    for (const product of gpuProducts) {
      if (!product.name) continue;

      const existingGPU = await GPU.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingGPU) {
        console.log(`ℹ️  GPU component already exists for: ${product.name}`);
        continue;
      }

      const gpu = new GPU();
      gpu.product = product;

      if (product.name.includes("NVIDIA GeForce RTX 4090")) {
        gpu.brand = "NVIDIA";
        gpu.model = "GeForce RTX 4090";
        gpu.vram = 24;
        gpu.chipset = "AD102";
        gpu.memoryType = "GDDR6X";
        gpu.lengthMm = 304;
        gpu.tdp = 450;
      } else if (product.name.includes("AMD Radeon RX 7900 XTX")) {
        gpu.brand = "AMD";
        gpu.model = "Radeon RX 7900 XTX";
        gpu.vram = 24;
        gpu.chipset = "Navi 31";
        gpu.memoryType = "GDDR6";
        gpu.lengthMm = 287;
        gpu.tdp = 355;
      } else if (product.name.includes("NVIDIA GeForce RTX 4080")) {
        gpu.brand = "NVIDIA";
        gpu.model = "GeForce RTX 4080";
        gpu.vram = 16;
        gpu.chipset = "AD103";
        gpu.memoryType = "GDDR6X";
        gpu.lengthMm = 304;
        gpu.tdp = 320;
      } else if (product.name.includes("AMD Radeon RX 7800 XT")) {
        gpu.brand = "AMD";
        gpu.model = "Radeon RX 7800 XT";
        gpu.vram = 16;
        gpu.chipset = "Navi 32";
        gpu.memoryType = "GDDR6";
        gpu.lengthMm = 267;
        gpu.tdp = 263;
      } else if (product.name.includes("NVIDIA GeForce RTX 4070 Ti")) {
        gpu.brand = "NVIDIA";
        gpu.model = "GeForce RTX 4070 Ti";
        gpu.vram = 12;
        gpu.chipset = "AD104";
        gpu.memoryType = "GDDR6X";
        gpu.lengthMm = 285;
        gpu.tdp = 285;
      } else if (product.name.includes("AMD Radeon RX 7700 XT")) {
        gpu.brand = "AMD";
        gpu.model = "Radeon RX 7700 XT";
        gpu.vram = 12;
        gpu.chipset = "Navi 32";
        gpu.memoryType = "GDDR6";
        gpu.lengthMm = 267;
        gpu.tdp = 245;
      } else if (product.name.includes("NVIDIA GeForce RTX 4060 Ti")) {
        gpu.brand = "NVIDIA";
        gpu.model = "GeForce RTX 4060 Ti";
        gpu.vram = 8;
        gpu.chipset = "AD106";
        gpu.memoryType = "GDDR6";
        gpu.lengthMm = 242;
        gpu.tdp = 160;
      } else {
        // Default values
        gpu.brand = product.name.split(" ")[0];
        gpu.model = product.name.split(" ").slice(1).join(" ") || product.name;
        gpu.vram = 8;
        gpu.chipset = "Unknown";
        gpu.memoryType = "GDDR6";
        gpu.lengthMm = 250;
        gpu.tdp = 200;
        console.log(`⚠️  Using default values for GPU: ${product.name}`);
      }

      await gpu.save();
      savedComponents.push(gpu);
      gpuCount++;
      console.log(`✅ Added GPU component for: ${product.name}`);
    }
    console.log(`✅ GPU components seeded: ${gpuCount} components\n`);

    // RAM Components
    console.log("💾 Step 3: Seeding RAM components...");
    const ramProducts = products.filter((p) => p.category?.slug === "ram");
    let ramCount = 0;
    for (const product of ramProducts) {
      if (!product.name) continue;

      const existingRAM = await RAM.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingRAM) {
        console.log(`ℹ️  RAM component already exists for: ${product.name}`);
        continue;
      }

      const ram = new RAM();
      ram.product = product;

      // Extract thông tin từ product name
      if (product.name.includes("Corsair Vengeance RGB Pro 32GB")) {
        ram.brand = "Corsair";
        ram.model = "Vengeance RGB Pro";
        ram.capacityGb = 32;
        ram.speedMhz = 3600;
        ram.type = "DDR4";
      } else if (product.name.includes("G.Skill Trident Z5 RGB 32GB")) {
        ram.brand = "G.Skill";
        ram.model = "Trident Z5 RGB";
        ram.capacityGb = 32;
        ram.speedMhz = 6000;
        ram.type = "DDR5";
      } else if (product.name.includes("Kingston Fury Beast")) {
        ram.brand = "Kingston";
        ram.model = "Fury Beast";
        const capacityMatch = product.name.match(/(\d+)GB/);
        ram.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) : 16;
        const speedMatch = product.name.match(/DDR\d-(\d+)/);
        ram.speedMhz = speedMatch ? parseInt(speedMatch[1]) : 3200;
        ram.type = product.name.includes("DDR5") ? "DDR5" : "DDR4";
      } else if (product.name.includes("Crucial Ballistix MAX 64GB")) {
        ram.brand = "Crucial";
        ram.model = "Ballistix MAX";
        ram.capacityGb = 64;
        ram.speedMhz = 4000;
        ram.type = "DDR4";
      } else if (product.name.includes("TeamGroup T-Force Delta RGB")) {
        ram.brand = "TeamGroup";
        ram.model = "T-Force Delta RGB";
        const capacityMatch = product.name.match(/(\d+)GB/);
        ram.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) : 32;
        const speedMatch = product.name.match(/DDR\d-(\d+)/);
        ram.speedMhz = speedMatch ? parseInt(speedMatch[1]) : 3600;
        ram.type = product.name.includes("DDR5") ? "DDR5" : "DDR4";
      } else if (product.name.includes("Patriot Viper")) {
        ram.brand = "Patriot";
        const capacityMatch = product.name.match(/(\d+)GB/);
        ram.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) : 16;
        const speedMatch = product.name.match(/DDR\d-(\d+)/);
        ram.speedMhz = speedMatch ? parseInt(speedMatch[1]) : 3200;
        ram.type = product.name.includes("DDR5") ? "DDR5" : "DDR4";
        if (product.name.includes("Steel")) {
          ram.model = "Viper Steel";
        } else if (product.name.includes("Venom")) {
          ram.model = "Viper Venom";
        } else {
          ram.model = "Viper";
        }
      } else if (product.name.includes("Corsair Dominator Platinum")) {
        ram.brand = "Corsair";
        ram.model = "Dominator Platinum RGB";
        ram.capacityGb = 32;
        ram.speedMhz = 6000;
        ram.type = "DDR5";
      } else if (product.name.includes("G.Skill Ripjaws S5")) {
        ram.brand = "G.Skill";
        ram.model = "Ripjaws S5";
        ram.capacityGb = 32;
        const speedMatch = product.name.match(/DDR\d-(\d+)/);
        ram.speedMhz = speedMatch ? parseInt(speedMatch[1]) : 5600;
        ram.type = "DDR5";
      } else if (product.name.includes("ADATA XPG Lancer RGB")) {
        ram.brand = "ADATA";
        ram.model = "XPG Lancer RGB";
        ram.capacityGb = 32;
        ram.speedMhz = 6000;
        ram.type = "DDR5";
      } else if (product.name.includes("PNY XLR8 Gaming")) {
        ram.brand = "PNY";
        ram.model = "XLR8 Gaming";
        ram.capacityGb = 32;
        ram.speedMhz = 6000;
        ram.type = "DDR5";
      } else if (product.name.includes("Samsung") && product.name.includes("DDR5")) {
        ram.brand = "Samsung";
        ram.model = "DDR5";
        ram.capacityGb = 32;
        const speedMatch = product.name.match(/DDR\d-(\d+)/);
        ram.speedMhz = speedMatch ? parseInt(speedMatch[1]) : 4800;
        ram.type = "DDR5";
      } else if (product.name.includes("Lexar ARES RGB")) {
        ram.brand = "Lexar";
        ram.model = "ARES RGB";
        ram.capacityGb = 32;
        ram.speedMhz = 5600;
        ram.type = "DDR5";
      } else {
        // Default values - try to extract from name
        const nameParts = product.name.split(" ");
        ram.brand = nameParts[0];
        ram.model = nameParts.slice(1, -1).join(" ") || "Standard";
        const capacityMatch = product.name.match(/(\d+)GB/);
        ram.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) : 16;
        const speedMatch = product.name.match(/DDR\d-(\d+)/);
        ram.speedMhz = speedMatch ? parseInt(speedMatch[1]) : 3200;
        ram.type = product.name.includes("DDR5") ? "DDR5" : "DDR4";
        console.log(`⚠️  Using extracted/default values for RAM: ${product.name}`);
      }

      await ram.save();
      savedComponents.push(ram);
      ramCount++;
      console.log(`✅ Added RAM component for: ${product.name}`);
    }
    console.log(`✅ RAM components seeded: ${ramCount} components\n`);

    // Drive Components
    console.log("💿 Step 4: Seeding Drive components...");
    const driveProducts = products.filter((p) => p.category?.slug === "drive");
    let driveCount = 0;
    for (const product of driveProducts) {
      if (!product.name) continue;

      const existingDrive = await Drive.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingDrive) {
        console.log(`ℹ️  Drive component already exists for: ${product.name}`);
        continue;
      }

      const drive = new Drive();
      drive.product = product;

      if (product.name.includes("Samsung 970 EVO Plus")) {
        drive.brand = "Samsung";
        drive.model = "970 EVO Plus";
        drive.type = "SSD";
        drive.capacityGb = 1000;
        drive.interface = "NVMe M.2";
      } else if (product.name.includes("WD Black SN850X")) {
        drive.brand = "Western Digital";
        drive.model = "Black SN850X";
        drive.type = "SSD";
        const capacityMatch = product.name.match(/(\d+)TB/);
        drive.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) * 1000 : 2000;
        drive.interface = "NVMe M.2";
      } else if (product.name.includes("Seagate Barracuda")) {
        drive.brand = "Seagate";
        drive.model = "Barracuda";
        drive.type = "HDD";
        const capacityMatch = product.name.match(/(\d+)TB/);
        drive.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) * 1000 : 2000;
        drive.interface = "SATA 6Gb/s";
      } else if (product.name.includes("Crucial P5 Plus")) {
        drive.brand = "Crucial";
        drive.model = "P5 Plus";
        drive.type = "SSD";
        const capacityMatch = product.name.match(/(\d+)TB/);
        drive.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) * 1000 : 1000;
        drive.interface = "NVMe M.2";
      } else if (product.name.includes("Sabrent Rocket 4 Plus")) {
        drive.brand = "Sabrent";
        drive.model = "Rocket 4 Plus";
        drive.type = "SSD";
        drive.capacityGb = 2000;
        drive.interface = "NVMe M.2";
      } else if (product.name.includes("Western Digital Blue")) {
        drive.brand = "Western Digital";
        drive.model = "Blue";
        drive.type = "HDD";
        const capacityMatch = product.name.match(/(\d+)TB/);
        drive.capacityGb = capacityMatch ? parseInt(capacityMatch[1]) * 1000 : 4000;
        drive.interface = "SATA 6Gb/s";
      } else if (product.name.includes("Samsung 980 PRO")) {
        drive.brand = "Samsung";
        drive.model = "980 PRO";
        drive.type = "SSD";
        drive.capacityGb = 1000;
        drive.interface = "NVMe M.2";
      } else {
        // Default values
        const nameParts = product.name.split(" ");
        drive.brand = nameParts[0];
        drive.model = nameParts.slice(1, -1).join(" ") || "Standard";
        drive.type = product.name.includes("SSD") || product.name.includes("NVMe") ? "SSD" : "HDD";
        const capacityMatch = product.name.match(/(\d+)(TB|GB)/);
        if (capacityMatch) {
          const value = parseInt(capacityMatch[1]);
          drive.capacityGb = capacityMatch[2] === "TB" ? value * 1000 : value;
        } else {
          drive.capacityGb = 1000;
        }
        drive.interface = product.name.includes("NVMe") ? "NVMe M.2" : "SATA 6Gb/s";
        console.log(`⚠️  Using extracted/default values for Drive: ${product.name}`);
      }

      await drive.save();
      savedComponents.push(drive);
      driveCount++;
      console.log(`✅ Added Drive component for: ${product.name}`);
    }
    console.log(`✅ Drive components seeded: ${driveCount} components\n`);

    // Motherboard Components
    console.log("🔌 Step 5: Seeding Motherboard components...");
    const motherboardProducts = products.filter((p) => p.category?.slug === "motherboard");
    let motherboardCount = 0;
    for (const product of motherboardProducts) {
      if (!product.name) continue;

      const existingMB = await Motherboard.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingMB) {
        console.log(`ℹ️  Motherboard component already exists for: ${product.name}`);
        continue;
      }

      const motherboard = new Motherboard();
      motherboard.product = product;

      if (product.name.includes("ASUS ROG Maximus Z790 Hero")) {
        motherboard.brand = "ASUS";
        motherboard.model = "ROG Maximus Z790 Hero";
        motherboard.chipset = "Intel Z790";
        motherboard.socket = "LGA 1700";
        motherboard.formFactor = "ATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = "DDR5";
      } else if (product.name.includes("MSI MPG B650 Carbon WiFi")) {
        motherboard.brand = "MSI";
        motherboard.model = "MPG B650 Carbon WiFi";
        motherboard.chipset = "AMD B650";
        motherboard.socket = "AM5";
        motherboard.formFactor = "ATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = "DDR5";
      } else if (product.name.includes("Gigabyte B760 Aorus Elite")) {
        motherboard.brand = "Gigabyte";
        motherboard.model = "B760 Aorus Elite";
        motherboard.chipset = "Intel B760";
        motherboard.socket = "LGA 1700";
        motherboard.formFactor = "ATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = "DDR4";
      } else if (product.name.includes("ASRock B650E PG Riptide WiFi")) {
        motherboard.brand = "ASRock";
        motherboard.model = "B650E PG Riptide WiFi";
        motherboard.chipset = "AMD B650E";
        motherboard.socket = "AM5";
        motherboard.formFactor = "ATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = "DDR5";
      } else if (product.name.includes("MSI PRO Z690-A WiFi")) {
        motherboard.brand = "MSI";
        motherboard.model = "PRO Z690-A WiFi";
        motherboard.chipset = "Intel Z690";
        motherboard.socket = "LGA 1700";
        motherboard.formFactor = "ATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = "DDR4";
      } else if (product.name.includes("ASUS TUF Gaming B760M-Plus WiFi")) {
        motherboard.brand = "ASUS";
        motherboard.model = "TUF Gaming B760M-Plus WiFi";
        motherboard.chipset = "Intel B760";
        motherboard.socket = "LGA 1700";
        motherboard.formFactor = "mATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = "DDR4";
      } else if (product.name.includes("ASUS ROG Strix Z690-A")) {
        motherboard.brand = "ASUS";
        motherboard.model = "ROG Strix Z690-A";
        motherboard.chipset = "Intel Z690";
        motherboard.socket = "LGA 1700";
        motherboard.formFactor = "ATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = "DDR4";
      } else {
        // Default values - try to extract
        const nameParts = product.name.split(" ");
        motherboard.brand = nameParts[0];
        motherboard.model = nameParts.slice(1).join(" ") || "Standard";
        motherboard.chipset = product.name.match(/([A-Z]\d+[A-Z]?)/)?.[1] || "Unknown";
        motherboard.socket = product.name.includes("LGA") ? "LGA 1700" : product.name.includes("AM5") ? "AM5" : "AM4";
        motherboard.formFactor = product.name.includes("mATX") || product.name.includes("Micro") ? "mATX" : "ATX";
        motherboard.ramSlots = 4;
        motherboard.maxRam = 128;
        motherboard.ramType = product.name.includes("DDR5") ? "DDR5" : "DDR4";
        console.log(`⚠️  Using extracted/default values for Motherboard: ${product.name}`);
      }

      await motherboard.save();
      savedComponents.push(motherboard);
      motherboardCount++;
      console.log(`✅ Added Motherboard component for: ${product.name}`);
    }
    console.log(`✅ Motherboard components seeded: ${motherboardCount} components\n`);

    // PSU Components
    console.log("⚡ Step 6: Seeding PSU components...");
    const psuProducts = products.filter((p) => p.category?.slug === "psu");
    let psuCount = 0;
    for (const product of psuProducts) {
      if (!product.name) continue;

      const existingPSU = await PSU.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingPSU) {
        console.log(`ℹ️  PSU component already exists for: ${product.name}`);
        continue;
      }

      const psu = new PSU();
      psu.product = product;

      if (product.name.includes("Corsair RM850x")) {
        psu.brand = "Corsair";
        psu.model = "RM850x";
        psu.wattage = 850;
        psu.efficiencyRating = "80+ Gold";
        psu.modular = "Fully Modular";
      } else if (product.name.includes("Seasonic Focus GX-750")) {
        psu.brand = "Seasonic";
        psu.model = "Focus GX-750";
        psu.wattage = 750;
        psu.efficiencyRating = "80+ Gold";
        psu.modular = "Fully Modular";
      } else if (product.name.includes("EVGA SuperNOVA 1000W")) {
        psu.brand = "EVGA";
        psu.model = "SuperNOVA 1000W";
        psu.wattage = 1000;
        psu.efficiencyRating = "80+ Platinum";
        psu.modular = "Fully Modular";
      } else if (product.name.includes("be quiet! Straight Power 11 850W")) {
        psu.brand = "be quiet!";
        psu.model = "Straight Power 11 850W";
        psu.wattage = 850;
        psu.efficiencyRating = "80+ Gold";
        psu.modular = "Fully Modular";
      } else if (product.name.includes("Cooler Master V850 Gold V2")) {
        psu.brand = "Cooler Master";
        psu.model = "V850 Gold V2";
        psu.wattage = 850;
        psu.efficiencyRating = "80+ Gold";
        psu.modular = "Fully Modular";
      } else if (product.name.includes("Thermaltake Toughpower GF1 750W")) {
        psu.brand = "Thermaltake";
        psu.model = "Toughpower GF1 750W";
        psu.wattage = 750;
        psu.efficiencyRating = "80+ Gold";
        psu.modular = "Fully Modular";
      } else if (product.name.includes("Corsair RM1000x")) {
        psu.brand = "Corsair";
        psu.model = "RM1000x";
        psu.wattage = 1000;
        psu.efficiencyRating = "80+ Gold";
        psu.modular = "Fully Modular";
      } else if (product.name.includes("EVGA SuperNOVA 850 G5")) {
        psu.brand = "EVGA";
        psu.model = "SuperNOVA 850 G5";
        psu.wattage = 850;
        psu.efficiencyRating = "80+ Gold";
        psu.modular = "Fully Modular";
      } else {
        // Default values - extract wattage and rating
        const nameParts = product.name.split(" ");
        psu.brand = nameParts[0];
        psu.model = nameParts.slice(1, -1).join(" ") || "Standard";
        const wattageMatch = product.name.match(/(\d+)W/);
        psu.wattage = wattageMatch ? parseInt(wattageMatch[1]) : 750;
        psu.efficiencyRating = product.name.includes("Platinum") ? "80+ Platinum" : product.name.includes("Gold") ? "80+ Gold" : "80+ Bronze";
        psu.modular = product.name.includes("Modular") ? "Fully Modular" : "Semi Modular";
        console.log(`⚠️  Using extracted/default values for PSU: ${product.name}`);
      }

      await psu.save();
      savedComponents.push(psu);
      psuCount++;
      console.log(`✅ Added PSU component for: ${product.name}`);
    }
    console.log(`✅ PSU components seeded: ${psuCount} components\n`);

    // Case Components
    console.log("📦 Step 7: Seeding Case components...");
    const caseProducts = products.filter((p) => p.category?.slug === "case");
    let caseCount = 0;
    for (const product of caseProducts) {
      if (!product.name) continue;

      const existingCase = await Case.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingCase) {
        console.log(`ℹ️  Case component already exists for: ${product.name}`);
        continue;
      }

      const caseComponent = new Case();
      caseComponent.product = product;

      if (product.name.includes("NZXT H510 Elite")) {
        caseComponent.brand = "NZXT";
        caseComponent.model = "H510 Elite";
        caseComponent.formFactorSupport = "ATX, mATX, ITX";
        caseComponent.hasRgb = true;
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 381;
        caseComponent.psuType = "ATX";
      } else if (product.name.includes("Lian Li O11 Dynamic") || product.name.includes("PC-O11 Dynamic")) {
        caseComponent.brand = "Lian Li";
        caseComponent.model = "O11 Dynamic";
        caseComponent.formFactorSupport = "ATX, mATX, ITX";
        caseComponent.hasRgb = false;
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 420;
        caseComponent.psuType = "ATX";
      } else if (product.name.includes("Phanteks Enthoo 719")) {
        caseComponent.brand = "Phanteks";
        caseComponent.model = "Enthoo 719";
        caseComponent.formFactorSupport = "E-ATX, ATX, mATX, ITX";
        caseComponent.hasRgb = false;
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 450;
        caseComponent.psuType = "ATX";
      } else if (product.name.includes("Fractal Design Meshify C")) {
        caseComponent.brand = "Fractal Design";
        caseComponent.model = "Meshify C";
        caseComponent.formFactorSupport = "ATX, mATX, ITX";
        caseComponent.hasRgb = false;
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 315;
        caseComponent.psuType = "ATX";
      } else if (product.name.includes("be quiet! Pure Base 500DX")) {
        caseComponent.brand = "be quiet!";
        caseComponent.model = "Pure Base 500DX";
        caseComponent.formFactorSupport = "ATX, mATX, ITX";
        caseComponent.hasRgb = true;
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 369;
        caseComponent.psuType = "ATX";
      } else if (product.name.includes("Corsair 4000D Airflow")) {
        caseComponent.brand = "Corsair";
        caseComponent.model = "4000D Airflow";
        caseComponent.formFactorSupport = "ATX, mATX, ITX";
        caseComponent.hasRgb = false;
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 360;
        caseComponent.psuType = "ATX";
      } else if (product.name.includes("NZXT H7 Flow")) {
        caseComponent.brand = "NZXT";
        caseComponent.model = "H7 Flow";
        caseComponent.formFactorSupport = "ATX, mATX, ITX";
        caseComponent.hasRgb = false;
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 400;
        caseComponent.psuType = "ATX";
      } else {
        // Default values
        const nameParts = product.name.split(" ");
        caseComponent.brand = nameParts[0];
        caseComponent.model = nameParts.slice(1).join(" ") || "Standard";
        caseComponent.formFactorSupport = "ATX, mATX, ITX";
        caseComponent.hasRgb = product.name.includes("RGB") || product.name.includes("RGB");
        caseComponent.sidePanelType = "Tempered Glass";
        caseComponent.maxGpuLengthMm = 350;
        caseComponent.psuType = "ATX";
        console.log(`⚠️  Using default values for Case: ${product.name}`);
      }

      await caseComponent.save();
      savedComponents.push(caseComponent);
      caseCount++;
      console.log(`✅ Added Case component for: ${product.name}`);
    }
    console.log(`✅ Case components seeded: ${caseCount} components\n`);

    // Monitor Components
    console.log("🖥️  Step 8: Seeding Monitor components...");
    const monitorProducts = products.filter((p) => p.category?.slug === "monitor");
    let monitorCount = 0;
    for (const product of monitorProducts) {
      if (!product.name) continue;

      const existingMonitor = await Monitor.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingMonitor) {
        console.log(`ℹ️  Monitor component already exists for: ${product.name}`);
        continue;
      }

      const monitor = new Monitor();
      monitor.product = product;

      if (product.name.includes("Samsung Odyssey G9")) {
        monitor.brand = "Samsung";
        monitor.model = "Odyssey G9";
        monitor.sizeInch = 49.0;
        monitor.resolution = "5120x1440";
        monitor.refreshRate = 240;
        monitor.panelType = "VA";
      } else if (product.name.includes("LG 27GP850-B") || product.name.includes("LG UltraGear 27GP850-B")) {
        monitor.brand = "LG";
        monitor.model = "27GP850-B";
        monitor.sizeInch = 27.0;
        monitor.resolution = "2560x1440";
        monitor.refreshRate = 165;
        monitor.panelType = "IPS";
      } else if (product.name.includes("ASUS ROG Swift PG279Q")) {
        monitor.brand = "ASUS";
        monitor.model = "ROG Swift PG279Q";
        monitor.sizeInch = 27.0;
        monitor.resolution = "2560x1440";
        monitor.refreshRate = 165;
        monitor.panelType = "IPS";
      } else if (product.name.includes("AOC CU34G2X")) {
        monitor.brand = "AOC";
        monitor.model = "CU34G2X";
        monitor.sizeInch = 34.0;
        monitor.resolution = "3440x1440";
        monitor.refreshRate = 144;
        monitor.panelType = "VA";
      } else if (product.name.includes("MSI Optix MAG274QRF")) {
        monitor.brand = "MSI";
        monitor.model = "Optix MAG274QRF";
        monitor.sizeInch = 27.0;
        monitor.resolution = "2560x1440";
        monitor.refreshRate = 165;
        monitor.panelType = "IPS";
      } else if (product.name.includes("ViewSonic XG270QG")) {
        monitor.brand = "ViewSonic";
        monitor.model = "XG270QG";
        monitor.sizeInch = 27.0;
        monitor.resolution = "2560x1440";
        monitor.refreshRate = 165;
        monitor.panelType = "IPS";
      } else if (product.name.includes("Samsung Odyssey G7")) {
        monitor.brand = "Samsung";
        monitor.model = "Odyssey G7";
        monitor.sizeInch = 32.0;
        monitor.resolution = "2560x1440";
        monitor.refreshRate = 240;
        monitor.panelType = "VA";
      } else {
        // Default values - try to extract
        const nameParts = product.name.split(" ");
        monitor.brand = nameParts[0];
        monitor.model = nameParts.slice(1).join(" ") || "Standard";
        const sizeMatch = product.name.match(/(\d+)[\"\"]/);
        monitor.sizeInch = sizeMatch ? parseFloat(sizeMatch[1]) : 27.0;
        monitor.resolution = product.name.includes("1440p") ? "2560x1440" : product.name.includes("4K") ? "3840x2160" : "1920x1080";
        const refreshMatch = product.name.match(/(\d+)Hz/);
        monitor.refreshRate = refreshMatch ? parseInt(refreshMatch[1]) : 144;
        monitor.panelType = product.name.includes("IPS") ? "IPS" : product.name.includes("VA") ? "VA" : "TN";
        console.log(`⚠️  Using extracted/default values for Monitor: ${product.name}`);
      }

      await monitor.save();
      savedComponents.push(monitor);
      monitorCount++;
      console.log(`✅ Added Monitor component for: ${product.name}`);
    }
    console.log(`✅ Monitor components seeded: ${monitorCount} components\n`);

    // Mouse Components
    console.log("🖱️  Step 9: Seeding Mouse components...");
    const mouseProducts = products.filter((p) => p.category?.slug === "mouse");
    let mouseCount = 0;
    for (const product of mouseProducts) {
      if (!product.name) continue;

      const existingMouse = await Mouse.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingMouse) {
        console.log(`ℹ️  Mouse component already exists for: ${product.name}`);
        continue;
      }

      const mouse = new Mouse();
      mouse.product = product;

      if (product.name.includes("Logitech G Pro X Superlight")) {
        mouse.type = "Gaming";
        mouse.dpi = 25600;
        mouse.connectivity = "Wireless";
        mouse.hasRgb = false;
      } else if (product.name.includes("Razer DeathAdder V3 Pro")) {
        mouse.type = "Gaming";
        mouse.dpi = 30000;
        mouse.connectivity = "Wireless";
        mouse.hasRgb = true;
      } else if (product.name.includes("SteelSeries Rival 600")) {
        mouse.type = "Gaming";
        mouse.dpi = 12000;
        mouse.connectivity = "Wired";
        mouse.hasRgb = true;
      } else if (product.name.includes("Glorious Model O Wireless")) {
        mouse.type = "Gaming";
        mouse.dpi = 19000;
        mouse.connectivity = "Wireless";
        mouse.hasRgb = true;
      } else if (product.name.includes("Pulsar Xlite V2")) {
        mouse.type = "Gaming";
        mouse.dpi = 19000;
        mouse.connectivity = "Wireless";
        mouse.hasRgb = false;
      } else if (product.name.includes("Endgame Gear XM1r")) {
        mouse.type = "Gaming";
        mouse.dpi = 19000;
        mouse.connectivity = "Wired";
        mouse.hasRgb = false;
      } else {
        // Default values
        mouse.type = "Gaming";
        mouse.dpi = 16000;
        mouse.connectivity = product.name.includes("Wireless") ? "Wireless" : "Wired";
        mouse.hasRgb = product.name.includes("RGB");
        console.log(`⚠️  Using default values for Mouse: ${product.name}`);
      }

      await mouse.save();
      savedComponents.push(mouse);
      mouseCount++;
      console.log(`✅ Added Mouse component for: ${product.name}`);
    }
    console.log(`✅ Mouse components seeded: ${mouseCount} components\n`);

    // Keyboard Components
    console.log("⌨️  Step 10: Seeding Keyboard components...");
    const keyboardProducts = products.filter((p) => p.category?.slug === "keyboard");
    let keyboardCount = 0;
    for (const product of keyboardProducts) {
      if (!product.name) continue;

      const existingKeyboard = await Keyboard.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingKeyboard) {
        console.log(`ℹ️  Keyboard component already exists for: ${product.name}`);
        continue;
      }

      const keyboard = new Keyboard();
      keyboard.product = product;

      if (product.name.includes("Corsair K100 RGB")) {
        keyboard.type = "Mechanical";
        keyboard.switchType = "Optical-Mechanical";
        keyboard.connectivity = "Wired";
        keyboard.layout = "Full-size";
        keyboard.hasRgb = true;
      } else if (product.name.includes("Razer BlackWidow V3 Pro")) {
        keyboard.type = "Mechanical";
        keyboard.switchType = "Razer Yellow";
        keyboard.connectivity = "Wireless";
        keyboard.layout = "Full-size";
        keyboard.hasRgb = true;
      } else if (product.name.includes("SteelSeries Apex Pro")) {
        keyboard.type = "Mechanical";
        keyboard.switchType = "OmniPoint";
        keyboard.connectivity = "Wireless";
        keyboard.layout = "TKL";
        keyboard.hasRgb = true;
      } else if (product.name.includes("Ducky One 3 RGB")) {
        keyboard.type = "Mechanical";
        keyboard.switchType = "Cherry MX";
        keyboard.connectivity = "Wired";
        keyboard.layout = "Full-size";
        keyboard.hasRgb = true;
      } else if (product.name.includes("Varmilo VA87M")) {
        keyboard.type = "Mechanical";
        keyboard.switchType = "Cherry MX";
        keyboard.connectivity = "Wired";
        keyboard.layout = "TKL";
        keyboard.hasRgb = false;
      } else if (product.name.includes("Leopold FC900R")) {
        keyboard.type = "Mechanical";
        keyboard.switchType = "Cherry MX";
        keyboard.connectivity = "Wired";
        keyboard.layout = "Full-size";
        keyboard.hasRgb = false;
      } else {
        // Default values
        keyboard.type = "Mechanical";
        keyboard.switchType = "Cherry MX";
        keyboard.connectivity = product.name.includes("Wireless") ? "Wireless" : "Wired";
        keyboard.layout = product.name.includes("TKL") ? "TKL" : "Full-size";
        keyboard.hasRgb = product.name.includes("RGB");
        console.log(`⚠️  Using default values for Keyboard: ${product.name}`);
      }

      await keyboard.save();
      savedComponents.push(keyboard);
      keyboardCount++;
      console.log(`✅ Added Keyboard component for: ${product.name}`);
    }
    console.log(`✅ Keyboard components seeded: ${keyboardCount} components\n`);

    // Headset Components
    console.log("🎧 Step 11: Seeding Headset components...");
    const headsetProducts = products.filter((p) => p.category?.slug === "headset");
    let headsetCount = 0;
    for (const product of headsetProducts) {
      if (!product.name) continue;

      const existingHeadset = await Headset.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingHeadset) {
        console.log(`ℹ️  Headset component already exists for: ${product.name}`);
        continue;
      }

      const headset = new Headset();
      headset.product = product;

      if (product.name.includes("SteelSeries Arctis Pro Wireless")) {
        headset.hasMicrophone = true;
        headset.connectivity = "Wireless";
        headset.surroundSound = true;
      } else if (product.name.includes("HyperX Cloud Alpha")) {
        headset.hasMicrophone = true;
        headset.connectivity = "Wired";
        headset.surroundSound = false;
      } else if (product.name.includes("Logitech G Pro X")) {
        headset.hasMicrophone = true;
        headset.connectivity = "Wireless";
        headset.surroundSound = true;
      } else if (product.name.includes("Beyerdynamic DT 990 Pro")) {
        headset.hasMicrophone = false;
        headset.connectivity = "Wired";
        headset.surroundSound = false;
      } else if (product.name.includes("Audio-Technica ATH-M50x")) {
        headset.hasMicrophone = false;
        headset.connectivity = "Wired";
        headset.surroundSound = false;
      } else if (product.name.includes("Sennheiser HD 560S")) {
        headset.hasMicrophone = false;
        headset.connectivity = "Wired";
        headset.surroundSound = false;
      } else {
        // Default values
        headset.hasMicrophone = product.name.includes("Microphone") || !product.name.includes("Headphone");
        headset.connectivity = product.name.includes("Wireless") ? "Wireless" : "Wired";
        headset.surroundSound = product.name.includes("Surround") || product.name.includes("7.1");
        console.log(`⚠️  Using default values for Headset: ${product.name}`);
      }

      await headset.save();
      savedComponents.push(headset);
      headsetCount++;
      console.log(`✅ Added Headset component for: ${product.name}`);
    }
    console.log(`✅ Headset components seeded: ${headsetCount} components\n`);

    // Network Card Components
    console.log("📡 Step 12: Seeding Network Card components...");
    const networkCardProducts = products.filter((p) => p.category?.slug === "network-card");
    let networkCardCount = 0;
    for (const product of networkCardProducts) {
      if (!product.name) continue;

      const existingNetworkCard = await NetworkCard.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingNetworkCard) {
        console.log(`ℹ️  Network Card component already exists for: ${product.name}`);
        continue;
      }

      const networkCard = new NetworkCard();
      networkCard.product = product;

      if (product.name.includes("Intel AX200 WiFi 6")) {
        networkCard.type = "WiFi";
        networkCard.interface = "M.2";
        networkCard.speedMbps = 2400;
      } else if (product.name.includes("ASUS PCE-AC88")) {
        networkCard.type = "WiFi";
        networkCard.interface = "PCIe";
        networkCard.speedMbps = 2100;
      } else if (product.name.includes("TP-Link Archer T9E")) {
        networkCard.type = "WiFi";
        networkCard.interface = "PCIe";
        networkCard.speedMbps = 1900;
      } else if (product.name.includes("ASUS PCE-AX58BT")) {
        networkCard.type = "WiFi";
        networkCard.interface = "PCIe";
        networkCard.speedMbps = 2400;
      } else if (product.name.includes("Gigabyte GC-WBAX200")) {
        networkCard.type = "WiFi";
        networkCard.interface = "M.2";
        networkCard.speedMbps = 2400;
      } else if (product.name.includes("MSI AX1800")) {
        networkCard.type = "WiFi";
        networkCard.interface = "PCIe";
        networkCard.speedMbps = 1800;
      } else {
        // Default values
        networkCard.type = "WiFi";
        networkCard.interface = product.name.includes("M.2") ? "M.2" : "PCIe";
        const speedMatch = product.name.match(/(\d+)Mbps/);
        networkCard.speedMbps = speedMatch ? parseInt(speedMatch[1]) : 1200;
        console.log(`⚠️  Using default values for Network Card: ${product.name}`);
      }

      await networkCard.save();
      savedComponents.push(networkCard);
      networkCardCount++;
      console.log(`✅ Added Network Card component for: ${product.name}`);
    }
    console.log(`✅ Network Card components seeded: ${networkCardCount} components\n`);

    // Cooler Components
    console.log("❄️  Step 13: Seeding Cooler components...");
    const coolerProducts = products.filter((p) => p.category?.slug === "cooler");
    let coolerCount = 0;
    for (const product of coolerProducts) {
      if (!product.name) continue;

      const existingCooler = await Cooler.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingCooler) {
        console.log(`ℹ️  Cooler component already exists for: ${product.name}`);
        continue;
      }

      const cooler = new Cooler();
      cooler.product = product;

      if (product.name.includes("Noctua NH-D15")) {
        cooler.brand = "Noctua";
        cooler.model = "NH-D15";
        cooler.type = "Air";
        cooler.supportedSockets = "LGA 1700, AM4, AM5";
        cooler.fanSizeMm = 140;
      } else if (product.name.includes("Noctua NH-U12S")) {
        cooler.brand = "Noctua";
        cooler.model = "NH-U12S";
        cooler.type = "Air";
        cooler.supportedSockets = "LGA 1700, AM4, AM5";
        cooler.fanSizeMm = 120;
      } else if (product.name.includes("be quiet! Dark Rock Pro 4")) {
        cooler.brand = "be quiet!";
        cooler.model = "Dark Rock Pro 4";
        cooler.type = "Air";
        cooler.supportedSockets = "LGA 1700, AM4, AM5";
        cooler.fanSizeMm = 120;
      } else {
        // Default values
        const nameParts = product.name.split(" ");
        cooler.brand = nameParts[0];
        cooler.model = nameParts.slice(1).join(" ") || "Standard";
        cooler.type = product.name.includes("Liquid") || product.name.includes("AIO") ? "Liquid" : "Air";
        cooler.supportedSockets = "LGA 1700, AM4, AM5";
        cooler.fanSizeMm = product.name.includes("140") ? 140 : 120;
        console.log(`⚠️  Using default values for Cooler: ${product.name}`);
      }

      await cooler.save();
      savedComponents.push(cooler);
      coolerCount++;
      console.log(`✅ Added Cooler component for: ${product.name}`);
    }
    console.log(`✅ Cooler components seeded: ${coolerCount} components\n`);

    // Laptop Components (simplified - chỉ cần basic info)
    console.log("💻 Step 14: Seeding Laptop components...");
    const laptopProducts = products.filter((p) => p.category?.slug === "laptop");
    let laptopCount = 0;
    for (const product of laptopProducts) {
      if (!product.name) continue;

      const existingLaptop = await Laptop.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingLaptop) {
        console.log(`ℹ️  Laptop component already exists for: ${product.name}`);
        continue;
      }

      const laptop = new Laptop();
      laptop.product = product;

      // Extract basic info from product name
      const nameParts = product.name.split(" ");
      laptop.brand = nameParts[0];
      laptop.model = nameParts.slice(1).join(" ") || "Standard";
      
      // Default values - có thể enhance sau
      laptop.screenSize = product.name.match(/(\d+\.?\d*)[\"\"]/)?.[1] ? parseFloat(product.name.match(/(\d+\.?\d*)[\"\"]/)?.[1] || "15.6") : 15.6;
      laptop.screenType = product.name.includes("OLED") ? "OLED" : product.name.includes("IPS") ? "IPS" : "LED";
      laptop.resolution = product.name.includes("4K") ? "3840x2160" : product.name.includes("1440p") ? "2560x1440" : "1920x1080";
      laptop.batteryLifeHours = 8.0;
      laptop.weightKg = 2.0;
      laptop.os = product.name.includes("Mac") || product.name.includes("macOS") ? "macOS" : "Windows 11";
      laptop.ramCount = 2;

      await laptop.save();
      savedComponents.push(laptop);
      laptopCount++;
      console.log(`✅ Added Laptop component for: ${product.name}`);
    }
    console.log(`✅ Laptop components seeded: ${laptopCount} components\n`);

    // PC Components
    console.log("🖥️  Step 15: Seeding PC components...");
    const pcProducts = products.filter((p) => p.category?.slug === "pc");
    let pcCount = 0;
    for (const product of pcProducts) {
      if (!product.name) continue;

      const existingPC = await PC.findOne({
        where: { product: { id: product.id } },
        relations: ["product"],
      });

      if (existingPC) {
        console.log(`ℹ️  PC component already exists for: ${product.name}`);
        continue;
      }

      const pc = new PC();
      pc.product = product;

      // Extract from product name
      const nameParts = product.name.split(" ");
      pc.brand = nameParts[0];
      pc.model = nameParts.slice(1).join(" ") || "Standard";
      
      // Default values - extract from description if available
      pc.processor = "Intel Core i7";
      pc.ramGb = 16;
      pc.storageGb = 1000;
      pc.storageType = "NVMe SSD";
      pc.graphics = "NVIDIA GeForce RTX";
      pc.formFactor = "Mid Tower";
      pc.powerSupplyWattage = 750;
      pc.operatingSystem = "Windows 11 Pro";

      await pc.save();
      savedComponents.push(pc);
      pcCount++;
      console.log(`✅ Added PC component for: ${product.name}`);
    }
    console.log(`✅ PC components seeded: ${pcCount} components\n`);

    console.log("🎉 Component seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Total components created: ${savedComponents.length}`);
    console.log(`   - CPU: ${cpuCount}`);
    console.log(`   - GPU: ${gpuCount}`);
    console.log(`   - RAM: ${ramCount}`);
    console.log(`   - Drive: ${driveCount}`);
    console.log(`   - Motherboard: ${motherboardCount}`);
    console.log(`   - PSU: ${psuCount}`);
    console.log(`   - Case: ${caseCount}`);
    console.log(`   - Monitor: ${monitorCount}`);
    console.log(`   - Mouse: ${mouseCount}`);
    console.log(`   - Keyboard: ${keyboardCount}`);
    console.log(`   - Headset: ${headsetCount}`);
    console.log(`   - Network Card: ${networkCardCount}`);
    console.log(`   - Cooler: ${coolerCount}`);
    console.log(`   - Laptop: ${laptopCount}`);
    console.log(`   - PC: ${pcCount}`);
  } catch (error) {
    console.error("❌ Error during component seeding:", error);
    throw error;
  }
}
