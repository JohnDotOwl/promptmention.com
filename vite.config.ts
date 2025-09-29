import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        // Generate manifest.json for better caching
        manifest: true,
        // Split vendor chunks for better caching
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Core React and Inertia
                    if (id.includes('react') || id.includes('@inertiajs')) {
                        return 'react-vendor';
                    }
                    
                    // Chart libraries (heavy)
                    if (id.includes('recharts') || id.includes('d3')) {
                        return 'chart-vendor';
                    }
                    
                    // UI components and utilities
                    if (id.includes('lucide-react') || id.includes('clsx') || 
                        id.includes('tailwind-merge') || id.includes('@radix-ui')) {
                        return 'ui-vendor';
                    }
                    
                    // Form and validation libraries
                    if (id.includes('react-hook-form') || id.includes('zod')) {
                        return 'form-vendor';
                    }
                    
                    // Date/time utilities
                    if (id.includes('date-fns') || id.includes('moment')) {
                        return 'date-vendor';
                    }
                    
                    // Split large page components
                    if (id.includes('/pages/analytics') || id.includes('/pages/dashboard')) {
                        return 'analytics-pages';
                    }
                    
                    if (id.includes('/pages/monitors') || id.includes('/pages/prompts') || 
                        id.includes('/pages/responses')) {
                        return 'monitoring-pages';
                    }
                    
                    // Split layout components
                    if (id.includes('/layouts/') || id.includes('app-layout')) {
                        return 'layout-components';
                    }
                    
                    // Common utilities
                    if (id.includes('/utils/') || id.includes('/hooks/')) {
                        return 'app-utils';
                    }
                    
                    // Default chunk for everything else
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
        // Enable source maps for production debugging
        sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
        // Reduce chunk size warning limit to identify large chunks
        chunkSizeWarningLimit: 500,
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Use esbuild for minification (faster and built-in)
        minify: 'esbuild',
    },
});
