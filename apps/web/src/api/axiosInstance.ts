import Axios, { AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  timeout: 12000,
});

const CACHE_PREFIX = 'avenir_http_cache_v1:';

AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() === 'get' && response.config.url) {
      try {
        localStorage.setItem(
          `${CACHE_PREFIX}${response.config.url}`,
          JSON.stringify({
            timestamp: Date.now(),
            data: response.data,
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }
    return response;
  },
  (error) => {
    const config = error.config as AxiosRequestConfig | undefined;
    if (config?.method?.toLowerCase() === 'get' && config?.url) {
      try {
        const cached = localStorage.getItem(`${CACHE_PREFIX}${config.url}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          return Promise.resolve({
            data: parsed.data,
            status: 200,
            statusText: 'OK (Offline Cache)',
            headers: {},
            config,
          });
        }
      } catch {
        // Fall through
      }
    }
    return Promise.reject(error);
  }
);

export const customAxiosInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error Cancel method attached for Orval compatibility
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

