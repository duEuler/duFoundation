// Configuração mínima para evitar erro de módulo não encontrado
export default {
  plugins: [],
  resolve: {
    alias: {},
  },
  root: "./client",
  build: {
    outDir: "./dist/public",
  },
};