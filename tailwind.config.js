import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // colors: {
      //   background: "hsl(var(--color-background))",
      //   foreground: "hsl(var(--color-foreground))",
      //   card: {
      //     DEFAULT: "hsl(var(--color-card))",
      //     foreground: "hsl(var(--color-card-foreground))",
      //   },
      //   popover: {
      //     DEFAULT: "hsl(var(--color-popover))",
      //     foreground: "hsl(var(--color-popover-foreground))",
      //   },
      //   primary: {
      //     DEFAULT: "hsl(var(--color-primary))",
      //     foreground: "hsl(var(--color-primary-foreground))",
      //   },
      //   secondary: {
      //     DEFAULT: "hsl(var(--color-secondary))",
      //     foreground: "hsl(var(--color-secondary-foreground))",
      //   },
      //   muted: {
      //     DEFAULT: "hsl(var(--color-muted))",
      //     foreground: "hsl(var(--color-muted-foreground))",
      //   },
      //   accent: {
      //     DEFAULT: "hsl(var(--color-accent))",
      //     foreground: "hsl(var(--color-accent-foreground))",
      //   },
      //   destructive: {
      //     DEFAULT: "hsl(var(--color-destructive))",
      //     foreground: "hsl(var(--color-destructive-foreground))",
      //   },
      //   border: "hsl(var(--color-border))",
      //   input: "hsl(var(--color-input))",
      //   ring: "hsl(var(--color-ring))",
      //   "ring-offset": "hsl(var(--color-background))",
      //   "ring-offset-background": "hsl(var(--color-background))",
      // },
      ringOffsetWidth: {
        DEFAULT: "2px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "marquee-infinite": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "fadeIn": {
          "0%": { 
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)"
          },
        },
      },
      animation: {
        "marquee-infinite": "marquee-infinite 15s linear infinite",
        "fadeIn": "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [
    typography,
  ],
}