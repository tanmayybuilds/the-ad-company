import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { sourcemap: false, rolldownOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), gallery: fileURLToPath(new URL('./gallery.html', import.meta.url)) } } },
});
