import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { dark: "#0F766E", DEFAULT: "#16A34A", accent: "#F59E0B", soft: "#ECFDF5" },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -14px rgba(15, 118, 110, 0.28)",
        lift: "0 20px 44px -18px rgba(15, 118, 110, 0.45)",
      },
      keyframes: {
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        fadeUp: { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "none" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
