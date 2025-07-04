import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração mínima para evitar erro de módulo não encontrado
export default {
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  root: "./client",
  build: {
    outDir: "./dist/public",
  },
};