import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Adicionando cores para o modo de alto contraste
        'contrast-high': {
          bg: '#000000',      // Fundo preto
          text: '#FFFFFF',    // Texto branco
          border: '#FFFFFF',  // Bordas brancas
          accent: '#FFFF00',  // Elementos acentuados amarelos
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        // Adicionando animação para o modo de alto contraste
        "high-contrast-pulse": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Animação para elementos em alto contraste
        "contrast-pulse": "high-contrast-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      // Extensões para o modo de alto contraste
      backgroundColor: {
        'contrast-high': 'var(--contrast-high-bg)',
      },
      textColor: {
        'contrast-high': 'var(--contrast-high-text)',
      },
      borderColor: {
        'contrast-high': 'var(--contrast-high-border)',
      },
      accentColor: {
        'contrast-high': 'var(--contrast-high-accent)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Plugin para estilos de alto contraste
    function ({ addVariant, addUtilities }) {
      addVariant('contrast-high', '.contrast-high &');
      
      addUtilities({
        '.contrast-high': {
          '--contrast-high-bg': '#000000',
          '--contrast-high-text': '#FFFFFF',
          '--contrast-high-border': '#FFFFFF',
          '--contrast-high-accent': '#FFFF00',
          'background-color': 'var(--contrast-high-bg) !important',
          'color': 'var(--contrast-high-text) !important',
          'border-color': 'var(--contrast-high-border) !important',
        },
        '.contrast-high *': {
          'background-color': 'var(--contrast-high-bg) !important',
          'color': 'var(--contrast-high-text) !important',
          'border-color': 'var(--contrast-high-border) !important',
        },
        '.contrast-high a': {
          'color': 'var(--contrast-high-accent) !important',
          'text-decoration': 'underline !important',
        },
        '.contrast-high button': {
          'border': '2px solid var(--contrast-high-border) !important',
        },
        '.contrast-high .text-accent': {
          'color': 'var(--contrast-high-accent) !important',
        },
      });
    },
  ],
} satisfies Config

export default config