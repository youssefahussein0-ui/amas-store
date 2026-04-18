## Packages
zustand | State management for the shopping cart
framer-motion | Smooth, elegant animations for luxury feel
recharts | Admin dashboard charts

## Notes
Tailwind Config - extend fontFamily and colors:
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-sans)", "sans-serif"],
      serif: ["var(--font-serif)", "serif"],
    },
    colors: {
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
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      border: "hsl(var(--border))",
    }
  }
}
