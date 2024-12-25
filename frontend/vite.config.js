import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
    ],
  },
  css: {
    preprocessorOptions: {
      css: {
        includePaths: ['./node_modules'], // Ensure CSS files from node_modules are included
      },
    },
  },
});
