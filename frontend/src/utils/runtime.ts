import type { RuntimeConfig } from '../types/runtime';

/**
 * Get runtime configuration from window object
 */
export const getRuntimeConfig = (): RuntimeConfig => {
  return (
    window.__MCPHUB_CONFIG__ || {
      basePath: import.meta.env.VITE_BASE_PATH || '',
      version: 'dev',
      name: 'mcphub',
    }
  );
};

/**
 * Get the base path from runtime configuration
 */
export const getBasePath = (): string => {
  const config = getRuntimeConfig();
  const basePath = config.basePath || '';

  return basePath;
};

/**
 * Get the API base URL including base path and /api prefix
 */
export const getApiBaseUrl = (): string => {
  const basePath = getBasePath();
  // Always append /api to the base path for API endpoints
  return basePath + '/api';
};

/**
 * Construct a full API URL with the given endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return baseUrl + normalizedEndpoint;
};

/**
 * Load runtime configuration from server
 */
export const loadRuntimeConfig = async (): Promise<RuntimeConfig> => {
  try {
    // For initial config load, we need to determine the correct path
    // Try different possible paths based on current location
    const basePath = import.meta.env.VITE_BASE_PATH || '';
    const possibleConfigPaths = [
      basePath + '/config',
    ];

    for (const configPath of possibleConfigPaths) {
      try {
        const response = await fetch(configPath, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            return data.data;
          }
        }
      } catch (error) {
        // Continue to next path
        console.debug(`Failed to load config from ${configPath}:`, error);
      }
    }

    // Fallback to default config
    console.warn('Could not load runtime config from server, using defaults');
    return {
      basePath: import.meta.env.VITE_BASE_PATH || '',
      version: 'dev',
      name: 'mcphub',
    };
  } catch (error) {
    console.error('Error loading runtime config:', error);
    return {
      basePath: import.meta.env.VITE_BASE_PATH || '',
      version: 'dev',
      name: 'mcphub',
    };
  }
};
