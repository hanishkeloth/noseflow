import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

// Keep the browser entry outside pages/, which Vinext discovers as server routes.
export default defineConfig({
  root: fileURLToPath(new URL("./static-app", import.meta.url)),
  base: process.env.PAGES_BASE_PATH || "/noseflow/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  resolve: { alias: { "@": projectRoot } },
  css: { postcss: projectRoot },
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
