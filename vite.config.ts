// Project Vite configuration. The original template used a shared config package.
// If you need the shared behavior, replace the import below with your preferred
// config package or move those settings into this file.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
