import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "var(--background-color)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--primary-color)",
          foreground: "var(--background-color)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
        },
        secondary: {
          DEFAULT: "var(--background-secondary)",
          foreground: "var(--text-primary)",
          light: "var(--secondary-light)",
        },
        card: {
          DEFAULT: "var(--glass-bg)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--background-tertiary)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--background-tertiary)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        glass: {
          bg: "var(--glass-bg)",
          border: "var(--glass-border)",
          hover: "var(--glass-hover)",
        },
      },
      fontFamily: {
        main: ["var(--font-main)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;

