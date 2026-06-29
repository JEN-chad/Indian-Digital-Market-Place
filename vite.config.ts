import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const isAnalyze = process.env.ANALYZE === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Bundle visualizer — only active when ANALYZE=true (run: ANALYZE=true npm run build)
      ...(isAnalyze
        ? [
            visualizer({
              open: true,
              filename: 'dist/bundle-analysis.html',
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Target modern browsers for smaller output
      target: 'es2020',
      // Increase chunk size warning limit to 800kB
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // Manual chunk splitting for faster initial loads
          manualChunks: {
            // Vendor: React ecosystem
            'vendor-react': ['react', 'react-dom'],
            // Vendor: Animation
            'vendor-motion': ['framer-motion'],
            // Vendor: Icons  
            'vendor-icons': ['lucide-react'],
            // Vendor: Forms + Validation
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
    },
  };
});
