import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/Dashboard-protestos/",
  plugins: [react()],
})
