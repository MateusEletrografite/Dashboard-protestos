/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          canvas: '#f7f8fb',
          raised: '#ffffff',
          muted: '#f1f4f8',
          line: '#dfe4ec',
        },
        ink: {
          strong: '#111827',
          body: '#374151',
          muted: '#6b7280',
          subtle: '#9ca3af',
        },
        finance: {
          blue: '#2454a6',
          blueDark: '#173b76',
          teal: '#0f766e',
          green: '#15803d',
          amber: '#b45309',
          red: '#b42318',
        },
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 28px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
