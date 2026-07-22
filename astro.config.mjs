import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dentistforchildren.gr',
  compressHTML: true,
  build: {
    format: 'file',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
