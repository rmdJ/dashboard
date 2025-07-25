import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
  const envFile = mode === "production" ? ".env" : ".env.local";
  const envPath = path.resolve(process.cwd(), envFile);

  let env;
  if (fs.existsSync(envPath)) {
    env = Object.fromEntries(
      fs
        .readFileSync(envPath, "utf-8")
        .split("\n")
        .filter(Boolean)
        .map((line) => line.split("=")),
    );
  } else {
    env = loadEnv(mode, process.cwd(), "");
  }

  return {
    plugins: [react()],
    define: {
      "process.env": env,
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
    },
    build: {
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
