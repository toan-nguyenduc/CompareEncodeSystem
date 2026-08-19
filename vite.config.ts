import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    // Chỉ thêm base path khi chạy build trên GitHub Pages
    base: process.env.GITHUB_ACTIONS ? '/CompareEncodeSystem/' : '/',
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
