import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
      },
      borderRadius: {
        DEFAULT: '12px',
        'md': '8px',
        'sm': '6px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        surfaceSecondary: "var(--surface-secondary)",
        border: "var(--border)",
        textPrimary: "var(--text-primary)",
        textMuted: "var(--text-muted)",
        accent: "var(--accent)",
        accentHover: "var(--accent-hover)",
        hover: "var(--hover)",
      },
      boxShadow: {
        'card-sm': '0 1px 3px rgba(0,0,0,0.08)',
        'card-lg': '0 4px 16px rgba(0,0,0,0.06)',
      },
      fontSize: {
        'page-title': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'section-title': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'body-bold': ['15px', { lineHeight: '20px', fontWeight: '600' }],
        'caption': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-bold': ['13px', { lineHeight: '18px', fontWeight: '600' }],
      }
    },
  },
  plugins: [],
};
export default config;
