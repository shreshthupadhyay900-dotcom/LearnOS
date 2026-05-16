import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // This tells the new Vite 8 compiler to parse JSX elements inside regular .js files
      include: /\.(mdx|js|jsx|ts|tsx)$/,
    }),
  ],
})
