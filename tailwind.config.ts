import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        "section-alt": "hsl(var(--section-alt))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        glow: {
          blue: "hsl(var(--glow-blue))",
          "light-blue": "hsl(var(--glow-light-blue))",
          silver: "hsl(var(--glow-silver))",
          cyan: "hsl(var(--glow-cyan))",
          white: "hsl(var(--glow-white))",
          /* Legacy mappings */
          yellow: "hsl(var(--glow-blue))",
          lime: "hsl(var(--glow-light-blue))",
          pink: "hsl(var(--glow-light-blue))",
          orange: "hsl(var(--glow-cyan))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "blink-fast": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.4",
          },
        },
        "scroll-text": {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        "shine": {
          "0%": {
            transform: "translateX(-100%) skewX(-15deg)",
          },
          "100%": {
            transform: "translateX(200%) skewX(-15deg)",
          },
        },
        "subtle-zoom": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.03)",
          },
        },
        "marquee": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(calc(-100% - 3rem))",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blink-fast": "blink-fast 0.8s ease-in-out infinite",
        "scroll-text": "scroll-text 15s linear infinite",
        "shine": "shine 3s ease-in-out infinite",
        "subtle-zoom": "subtle-zoom 8s ease-in-out infinite",
        "marquee": "marquee 10s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
