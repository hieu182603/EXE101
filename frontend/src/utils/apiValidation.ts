export function validateApiResponse(response: any, context: string): void {
  if (!response.data || typeof response.data.success !== 'boolean') {
    throw new Error(`Invalid API response format in ${context}`);
  }
}

export function extractData<T>(response: any): T {
  validateApiResponse(response, 'extractData');
  return response.data.data || response.data;
}


