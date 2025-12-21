import api from "./apiInterceptor";

export interface BuildFilter {
  amount: number;
  cpuId?: string;
  motherboardId?: string;
  ramId?: string;
  gpuId?: string;
  psuId?: string;
  driveId?: string;
  coolerId?: string;
  caseId?: string;
  order?: "asc" | "desc";
  skip?: number;
  take?: number;
}

export interface BuildResult {
  builds: any[];
  count: number;
}

class RFQService {
  async getBuilds(filter: BuildFilter): Promise<BuildResult> {
    try {
      const response = await api.post("/request-for-quota/builds", filter);
      if (
        response.data &&
        response.data.builds &&
        typeof response.data.count === "number"
      ) {
        return { builds: response.data.builds, count: response.data.count };
      }
      if (
        response.data &&
        response.data.data &&
        response.data.data.builds &&
        typeof response.data.data.count === "number"
      ) {
        return {
          builds: response.data.data.builds,
          count: response.data.data.count,
        };
      }
      // fallback: treat as array
      if (response.data && Array.isArray(response.data)) {
        return { builds: response.data, count: response.data.length };
      }
      return { builds: [], count: 0 };
    } catch (error) {
      console.error("Error fetching builds:", error);
      return { builds: [], count: 0 };
    }
  }
}

export const rfqService = new RFQService();
