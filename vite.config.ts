// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";

// Server credentials stay in process.env, never in browser defines.
Object.assign(process.env, loadEnv(process.env.NODE_ENV || "development", process.cwd(), ""));
const entitiesPath = fileURLToPath(new URL("./node_modules/entities", import.meta.url));

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "entities/lib/decode.js": `${entitiesPath}/lib/decode.js`,
        "entities/lib/encode.js": `${entitiesPath}/lib/encode.js`,
        entities: entitiesPath,
      },
    },
  },
  // Outside Lovable, emit a conventional Node.js server bundle for hosts
  // such as Hostinger Web Apps. Lovable's own build preset still takes priority.
  nitro: { preset: "node-server" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
