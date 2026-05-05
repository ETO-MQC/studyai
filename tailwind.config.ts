import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0f172a",
        border: "#e5e7eb",
        card: "#ffffff",
        accent: "#f5f5f5",
        canvas: "#ffffff",
        panel: "#ffffff",
        sidebar: "#fafafa",
        ink: "#0f172a",
        muted: "#6b7280",
        "muted-foreground": "#6b7280",
        line: "#e5e7eb",
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#4f6df5",
          600: "#4162de",
          700: "#304ac0"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(15, 23, 42, 0.08)",
        subtle: "0 2px 8px rgba(15, 23, 42, 0.06)"
      },
      borderRadius: {
        app: "10px"
      }
    }
  },
  plugins: []
};

export default config;
