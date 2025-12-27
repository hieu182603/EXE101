const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  error: (message: string, data?: any) => {
    if (isDevelopment) {
      console.error(message, data);
    }
    // TODO: Send to error tracking service (Sentry) in production
  },

  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },

  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  }
};


