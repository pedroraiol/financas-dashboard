import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Meu Painel Financeiro",
        short_name: "Painel Financeiro",
        description:
          "Painel financeiro pessoal: controle receitas, despesas fixas e variáveis, e acompanhe sua saúde financeira com gráficos simples.",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#2a78d6",
        background_color: "#f9f9f7",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // App 100% client-side: sem dado nenhum vindo de rede, então cache-first pro
        // app shell inteiro é seguro e é o que permite abrir offline.
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    // O chunk do exceljs (~940kB) só carrega sob demanda ao exportar planilha
    // (import dinâmico em utils/spreadsheet.ts), então não pesa no carregamento inicial.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          "react-vendor": ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
