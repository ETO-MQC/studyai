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
        canvas: "#f7f7f5",
        panel: "#ffffff",
        sidebar: "#f4f3ef",
        ink: "#171717",
        muted: "#737373",
        line: "#e7e5df",
        brand: {
          50: "#f4f7ff",
          100: "#e9efff",
          500: "#4f6df5",
          600: "#4058d6",
          700: "#3041a5"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(24, 24, 24, 0.08)",
        subtle: "0 2px 10px rgba(24, 24, 24, 0.05)"
      },
      borderRadius: {
        app: "10px"
      }
    }
  },
  plugins: []
};

export default config;
