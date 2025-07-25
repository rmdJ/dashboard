import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["var(--font-roboto)"],
        montserrat: ["var(--font-montserrat)"],
      },
      colors: {
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderColor: {
        DEFAULT: "hsl(var(--border))",
      },
      backgroundColor: {
        DEFAULT: "hsl(var(--background))",
        "global-bg": "rgb(241, 240, 236)",
      },
      textColor: {
        DEFAULT: "hsl(var(--foreground))",
      },
      keyframes: {
        drawLine: {
          "0%": {
            width: "0%",
          },
          "100%": {
            width: "100%",
          },
        },
        logoAppear: {
          "0%": {
            transform: "translate(-50%, 100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translate(-50%, -50%)",
            opacity: "1",
          },
        },
      },
      animation: {
        "draw-line": "drawLine 0.5s ease-out forwards",
        "logo-appear": "logoAppear 0.5s ease-out forwards",
      },
      transitionDuration: {
        "1500": "1500ms",
      },
      transitionTimingFunction: {
        splash: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
