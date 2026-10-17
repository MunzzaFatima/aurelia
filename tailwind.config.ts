import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ivory: "#FAF6EE", cream: "#F3ECDD", beige: "#EDE3D0", charcoal: "#2A2826", gold: "#C6A664", "gold-deep": "#9C7F3F" },
      fontFamily: { serif: ["var(--font-serif)", "Georgia", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
} satisfies Config;
