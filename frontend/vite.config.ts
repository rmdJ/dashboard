import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "mongo-server",
      configureServer(server) {
        server.middlewares.use("/api", async (req, res) => {
          try {
            // @ts-expect-error - Module JS sans déclarations TypeScript
            const mongoModule = await import("./server/mongo.js");
            const { handleApiRequest } = mongoModule;
            await handleApiRequest(req, res);
          } catch (error) {
            console.error("API Server Error:", error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "API Server Error" }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["mongodb"],
  },
});
