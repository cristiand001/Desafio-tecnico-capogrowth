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
        background: "hsl(222, 47%, 11%)",
        foreground: "hsl(210, 40%, 98%)",
        primary: {
          DEFAULT: "hsl(263, 90%, 65%)",
          foreground: "hsl(210, 40%, 98%)",
        },
        secondary: {
          DEFAULT: "hsl(185, 100%, 50%)",
          foreground: "hsl(222, 47%, 11%)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
