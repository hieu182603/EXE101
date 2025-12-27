export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export function parseApiResponse<T>(response: any): T {
  // Handle nested data structures from backend
  if (response.data?.data) {
    return response.data.data;
  }
  if (response.data) {
    return response.data;
  }
  return response;
}

export function unwrapData<T>(response: any, dataKey?: string): T {
  const data = parseApiResponse(response);
  if (dataKey && data[dataKey]) {
    return data[dataKey];
  }
  return data;
}


