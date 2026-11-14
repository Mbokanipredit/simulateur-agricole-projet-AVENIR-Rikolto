import { defineConfig } from 'orval';

export default defineConfig({
  avenirApi: {
    input: {
      target: '../api/openapi.json',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/avenirApi.ts',
      client: 'axios-functions',
      override: {
        mutator: {
          path: './src/api/axiosInstance.ts',
          name: 'customAxiosInstance',
        },
      },
    },
  },
});

