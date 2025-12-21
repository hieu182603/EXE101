import { RFQ } from "./rfq.entity";
import { Case } from "@/product/components/case.entity";
import { Motherboard } from "@/product/components/motherboard.entity";
import { CPU } from "@/product/components/cpu.entity";
import { RAM } from "@/product/components/ram.entity";
import { GPU } from "@/product/components/gpu.entity";
import { PSU } from "@/product/components/psu.entity";
import { Drive } from "@/product/components/drive.entity";
import { Cooler } from "@/product/components/cooler.entity";
import { In, LessThanOrEqual } from "typeorm";
import { Build } from "./build.entity";
import { Service } from "typedi";
import { BuildFilterDTO } from "./dto/BuildFilter.dto";

// Mapping from component class name to Build slot
const COMPONENT_TYPE_TO_BUILD_SLOT: Record<string, keyof Build> = {
  CPU: "cpu",
  Motherboard: "motherboard",
  RAM: "ram",
  GPU: "gpu",
  PSU: "psu",
  Drive: "drive",
  Cooler: "cooler",
  Case: "case",
};

@Service()
export class RFQService {
  async createRFQ(rfq: RFQ) {
    return await rfq.save();
  }

  private parseFormFactors(s: string): string[] {
    return s.split(",").map((f) => f.trim());
  }
  private parseDriveInterfaces(s: string): string[] {
    return s.split(",").map((f) => f.trim());
  }
  private parseSockets(s: string): string[] {
    return s.split(",").map((f) => f.trim());
  }

  async getBuilds(filter: BuildFilterDTO) {
    const where: any = { amount: LessThanOrEqual(filter.amount) };
    // For each id, if present, filter by the product id of the component
    if (filter.cpuId) {
      where.cpu = { product: { id: filter.cpuId } };
    }
    if (filter.motherboardId) {
      where.motherboard = { product: { id: filter.motherboardId } };
    }
    if (filter.ramId) {
      where.ram = { product: { id: filter.ramId } };
    }
    if (filter.gpuId) {
      where.gpu = { product: { id: filter.gpuId } };
    }
    if (filter.psuId) {
      where.psu = { product: { id: filter.psuId } };
    }
    if (filter.driveId) {
      where.drive = { product: { id: filter.driveId } };
    }
    if (filter.coolerId) {
      where.cooler = { product: { id: filter.coolerId } };
    }
    if (filter.caseId) {
      where.case = { product: { id: filter.caseId } };
    }
    const [builds, count] = await Build.findAndCount({
      where,
      relations: [
        "cpu",
        "cpu.product",
        "motherboard",
        "motherboard.product",
        "ram",
        "ram.product",
        "gpu",
        "gpu.product",
        "psu",
        "psu.product",
        "drive",
        "drive.product",
        "cooler",
        "cooler.product",
        "case",
        "case.product",
      ],
      order: {
        amount: filter.order,
      },
      skip: filter.skip,
      take: filter.take,
    });
    return { builds, count };
  }

  async rfqProcess(amount: number) {
    // Memoization maps
    const mbRamMap = new Map();
    const mbDriveMap = new Map();
    const cpuCoolerMap = new Map();
    let buildCount = 0;
    const MAX_BUILDS = 1000; // Safety limit

    // Fetch all CPUs
    const allCPUs = await CPU.find({ relations: ["product"] });
    console.log(`[DEBUG] CPUs found: ${allCPUs.length}`);
    for (const cpu of allCPUs) {
      if (buildCount >= MAX_BUILDS) {
        console.log(
          `[DEBUG] Reached maximum builds limit (${MAX_BUILDS}), stopping.`
        );
        break;
      }
      // Fetch only motherboards compatible with this CPU
      const motherboards = await Motherboard.find({
        where: { socket: cpu.socket },
        relations: ["product"],
      });
      console.log(
        `[DEBUG] CPU ${cpu.id} (${cpu.socket}) compatible motherboards: ${motherboards.length}`
      );
      for (const mb of motherboards) {
        if (buildCount >= MAX_BUILDS) break;
        // RAMs compatible with this motherboard (memoized)
        let compatibleRAMs = mbRamMap.get(mb.id);
        if (!compatibleRAMs) {
          compatibleRAMs = await RAM.find({
            where: { type: mb.ramType },
            relations: ["product"],
          });
          mbRamMap.set(mb.id, compatibleRAMs);
        }
        console.log(
          `[DEBUG] Motherboard ${mb.id} (${mb.ramType}) compatible RAMs: ${compatibleRAMs.length}`
        );
        for (const ram of compatibleRAMs) {
          if (buildCount >= MAX_BUILDS) break;
          // Drives compatible with this motherboard (memoized)
          let compatibleDrives = mbDriveMap.get(mb.id);
          if (!compatibleDrives) {
            const interfaces = mb.supportedDriveInterfaces
              ? this.parseDriveInterfaces(mb.supportedDriveInterfaces)
              : [];
            const allDrives = await Drive.find({ relations: ["product"] });
            if (interfaces.length > 0) {
              compatibleDrives = allDrives.filter((drive) =>
                interfaces.some(
                  (iface) =>
                    drive.interface &&
                    drive.interface.toLowerCase().includes(iface.toLowerCase())
                )
              );
            } else {
              compatibleDrives = allDrives;
            }
            mbDriveMap.set(mb.id, compatibleDrives);
          }
          console.log(
            `[DEBUG] Motherboard ${mb.id} compatible drives: ${compatibleDrives.length}`
          );
          for (const drive of compatibleDrives) {
            if (buildCount >= MAX_BUILDS) break;
            // Cases compatible with this motherboard
            const cases = await Case.find({ relations: ["product"] });
            const compatibleCases = cases.filter((pcCase) =>
              this.parseFormFactors(pcCase.formFactorSupport).includes(
                mb.formFactor
              )
            );
            console.log(
              `[DEBUG] Motherboard ${mb.id} compatible cases: ${compatibleCases.length}`
            );
            for (const pcCase of compatibleCases) {
              if (buildCount >= MAX_BUILDS) break;
              // GPUs that fit in the case
              const gpus = await GPU.find({ relations: ["product"] });
              const compatibleGPUs = gpus.filter(
                (gpu) => gpu.lengthMm <= (pcCase.maxGpuLengthMm || 10000)
              );
              console.log(
                `[DEBUG] Case ${pcCase.id} compatible GPUs: ${compatibleGPUs.length}`
              );
              for (const gpu of compatibleGPUs) {
                if (buildCount >= MAX_BUILDS) break;
                // PSUs that fit the case and have enough wattage
                const totalTdp = (cpu.tdp || 0) + (gpu.tdp || 0) + 100;
                const psus = await PSU.find({ relations: ["product"] });
                const compatiblePSUs = psus.filter((psu) => {
                  const psuType = (psu as any).psuType;
                  return (
                    (!psuType ||
                      !pcCase.psuType ||
                      psuType === pcCase.psuType) &&
                    psu.wattage >= totalTdp
                  );
                });
                console.log(
                  `[DEBUG] Case ${pcCase.id} compatible PSUs: ${compatiblePSUs.length}`
                );
                for (const psu of compatiblePSUs) {
                  if (buildCount >= MAX_BUILDS) break;
                  // Coolers compatible with this CPU (memoized)
                  let compatibleCoolers = cpuCoolerMap.get(cpu.id);
                  if (!compatibleCoolers) {
                    const coolers = await Cooler.find({
                      relations: ["product"],
                    });
                    compatibleCoolers = coolers.filter((cooler: Cooler) =>
                      this.parseSockets(cooler.supportedSockets).includes(
                        cpu.socket
                      )
                    );
                    cpuCoolerMap.set(cpu.id, compatibleCoolers);
                  }
                  console.log(
                    `[DEBUG] CPU ${cpu.id} compatible coolers: ${compatibleCoolers.length}`
                  );
                  for (const cooler of compatibleCoolers) {
                    if (buildCount >= MAX_BUILDS) break;
                    // Calculate total price
                    const totalPrice = [
                      pcCase,
                      mb,
                      cpu,
                      ram,
                      gpu,
                      psu,
                      drive,
                      cooler,
                    ].reduce(
                      (sum, comp) => sum + (comp.product?.price || 0),
                      0
                    );
                    if (totalPrice > amount) continue;
                    // Save build
                    const build = new Build();
                    build.amount = totalPrice;
                    build.cpu = cpu;
                    build.motherboard = mb;
                    build.ram = ram;
                    build.gpu = gpu;
                    build.psu = psu;
                    build.drive = drive;
                    build.cooler = cooler;
                    build.case = pcCase;
                    await build.save();
                    buildCount++;
                    console.log(
                      `[DEBUG] Build created: CPU ${cpu.id}, MB ${mb.id}, RAM ${ram.id}, GPU ${gpu.id}, PSU ${psu.id}, Drive ${drive.id}, Cooler ${cooler.id}, Case ${pcCase.id}, Price: ${totalPrice}`
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(`[DEBUG] Total builds created: ${buildCount}`);
    return { buildsCreated: buildCount };
  }

  /**
   * Try to create new builds by swapping the new component into each existing build in its slot.
   * If no compatible builds are found, run rfqProcess to regenerate all builds.
   * @param component The new component entity (CPU, RAM, etc.)
   * @param componentType The slot name in Build (e.g., 'cpu', 'ram', ...)
   */
  async handleNewComponent(component: any, componentType: keyof Build) {
    // Fetch all existing builds with all relations
    const builds = await Build.find({
      relations: [
        "cpu",
        "motherboard",
        "ram",
        "gpu",
        "psu",
        "drive",
        "cooler",
        "case",
      ],
    });
    let compatibleFound = false;

    for (const build of builds) {
      // Create a new build object with the new component in the correct slot
      const newBuildObj = { ...build, [componentType]: component };
      if (!this.isBuildCompatible(newBuildObj)) continue;
      // Calculate total price
      const amount = [
        newBuildObj.cpu,
        newBuildObj.motherboard,
        newBuildObj.ram,
        newBuildObj.gpu,
        newBuildObj.psu,
        newBuildObj.drive,
        newBuildObj.cooler,
        newBuildObj.case,
      ].reduce((sum, comp) => sum + (comp?.product?.price || 0), 0);
      // Save new build
      const buildEntity = Build.create({
        cpu: newBuildObj.cpu,
        motherboard: newBuildObj.motherboard,
        ram: newBuildObj.ram,
        gpu: newBuildObj.gpu,
        psu: newBuildObj.psu,
        drive: newBuildObj.drive,
        cooler: newBuildObj.cooler,
        case: newBuildObj.case,
        amount,
      });
      await buildEntity.save();
      compatibleFound = true;
    }
    // If no compatible builds, run rfqProcess to regenerate all builds (with a high budget)
    if (!compatibleFound) {
      // Use a very large amount to allow all possible builds
      await this.rfqProcess(Number.MAX_SAFE_INTEGER);
    }
  }

  /**
   * Generic handler: pass any component instance, and it will update builds if relevant.
   */
  async handleNewComponentGeneric(component: any) {
    // Get the class name (e.g., 'CPU', 'RAM', etc.)
    // Handles both direct and proxied (TypeORM) entities
    const className = component.constructor.name.replace(/^Proxy_/, "");
    const slot = COMPONENT_TYPE_TO_BUILD_SLOT[className];
    if (!slot) {
      // Not a build-relevant component, do nothing
      return;
    }
    await this.handleNewComponent(component, slot);
  }

  // Returns true if the build is compatible according to the compatibility mapping
  isBuildCompatible(build: any): boolean {
    // 1. CPU ↔ Motherboard
    if (!build.cpu || !build.motherboard) return false;
    if (build.cpu.socket !== build.motherboard.socket) return false;

    // 2. RAM ↔ Motherboard
    if (!build.ram || build.ram.type !== build.motherboard.ramType)
      return false;

    // 3. Motherboard ↔ Case
    if (
      !build.case ||
      !this.parseFormFactors(build.case.formFactorSupport).includes(
        build.motherboard.formFactor
      )
    )
      return false;

    // 4. GPU ↔ Case
    if (!build.gpu || build.gpu.lengthMm > (build.case.maxGpuLengthMm || 10000))
      return false;

    // 5. PSU ↔ Case
    const psuType = (build.psu as any)?.psuType;
    if (psuType && build.case.psuType && psuType !== build.case.psuType)
      return false;

    // 6. GPU & CPU ↔ PSU
    const totalTdp = (build.cpu.tdp || 0) + (build.gpu.tdp || 0) + 100;
    if (!build.psu || build.psu.wattage < totalTdp) return false;

    // 7. Cooler ↔ CPU
    if (
      !build.cooler ||
      !this.parseSockets(build.cooler.supportedSockets).includes(
        build.cpu.socket
      )
    )
      return false;

    // 8. Drive ↔ Motherboard
    if (!build.drive) return false;
    const interfaces = build.motherboard.supportedDriveInterfaces
      ? this.parseDriveInterfaces(build.motherboard.supportedDriveInterfaces)
      : [];
    if (interfaces.length > 0 && !interfaces.includes(build.drive.interface))
      return false;

    return true;
  }
}
