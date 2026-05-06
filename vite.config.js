import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react-vendor";
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) return "firebase-vendor";
          if (id.includes("node_modules")) return "vendor";
        }
      }
    }
  },
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/e2e/**"]
  }
});
