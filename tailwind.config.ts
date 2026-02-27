import type { Config } from "tailwindcss";

// Tailwind scanning + small design-system extensions used by the app.
const config: Config = {
  content: [
    // Keep legacy `pages/` path for compatibility if routes are added later.
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // CSS variable hooks are available for future theming.
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        // Used by toast notifications.
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
