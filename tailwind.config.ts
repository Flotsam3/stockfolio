import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "main-dark": "#33313C"
      },
      gridTemplateColumns: {
        'custom-lg': '1fr 18% 10% 10% 14% 10% 10% 12%',
        'custom-sm': '25% 25% 25% 25%',
        'custom-md': '1fr auto auto auto auto auto 1fr',
      }
    },
  },
  plugins: [],
} satisfies Config;
