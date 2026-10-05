import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1F2A44",
        terracotta: "#E07A5F",
        sun: "#F2C14E",
        page: "#F5F5F2",
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      keyframes: {
        "page-in": { from: { opacity: "0", transform: "translateY(28px) scale(.99)", filter: "blur(4px)" }, to: { opacity: "1", transform: "none", filter: "none" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.96)" }, to: { opacity: "1", transform: "none" } },
        "slide-in-right": { from: { opacity: "0", transform: "translateX(110%)" }, to: { opacity: "1", transform: "none" } },
        bump: { "0%,100%": { transform: "scale(1)" }, "30%": { transform: "scale(1.35)" }, "60%": { transform: "scale(.9)" } },
        pop: { "0%": { transform: "scale(.6)", opacity: "0" }, "60%": { transform: "scale(1.15)", opacity: "1" }, "100%": { transform: "scale(1)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        shrink: { from: { transform: "scaleX(1)" }, to: { transform: "scaleX(0)" } },
        progress: { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(.85)" } },
      },
      animation: {
        "page-in": "page-in .6s cubic-bezier(.2,.8,.2,1) both",
        "fade-up": "fade-up .5s cubic-bezier(.2,.8,.2,1) both",
        "fade-in": "fade-in .3s ease-out both",
        "scale-in": "scale-in .35s cubic-bezier(.2,.8,.2,1) both",
        "slide-in-right": "slide-in-right .45s cubic-bezier(.2,.8,.2,1) both",
        bump: "bump .5s ease-out",
        pop: "pop .4s cubic-bezier(.2,.8,.2,1) both",
        shimmer: "shimmer 1.6s linear infinite",
        shrink: "shrink 5s linear both",
        progress: "progress 8s cubic-bezier(.1,.7,.2,1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
