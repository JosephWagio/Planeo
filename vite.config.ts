import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@dnd-kit")) return "drag-and-drop";
          if (id.includes("@phosphor-icons")) return "icons";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
