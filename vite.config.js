import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'birthday-gift' with your repo name exactly (case-sensitive)
export default defineConfig({
  base: '/happybirthday/',
  plugins: [react()],
})

