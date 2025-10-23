import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// Helper to replace environment variables in HTML
function replaceEnvVars(html: string): string {
  const envVars = {
    VITE_APP_ID: process.env.VITE_APP_ID || "",
    VITE_OAUTH_PORTAL_URL: process.env.VITE_OAUTH_PORTAL_URL || "",
    VITE_APP_TITLE: process.env.VITE_APP_TITLE || "App",
    VITE_APP_LOGO: process.env.VITE_APP_LOGO || "https://placehold.co/40x40/3b82f6/ffffff?text=App",
    VITE_ANALYTICS_ENDPOINT: process.env.VITE_ANALYTICS_ENDPOINT || "",
    VITE_ANALYTICS_WEBSITE_ID: process.env.VITE_ANALYTICS_WEBSITE_ID || "",
  };

  let result = html;
  Object.entries(envVars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`%${key}%`, "g"), value);
  });

  // Inject environment variables into window object for client-side access
  const envScript = `<script>
    window.__ENV__ = ${JSON.stringify(envVars)};
  </script>`;
  
  // Insert before closing body tag
  result = result.replace("</body>", `${envScript}</body>`);
  
  return result;
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  
  // Serve static files but intercept index.html to inject env vars
  app.use((req, res, next) => {
    if (req.path === "/" || req.path === "/index.html") {
      const indexPath = path.resolve(distPath, "index.html");
      fs.readFile(indexPath, "utf-8", (err, html) => {
        if (err) {
          res.status(404).send("Not found");
          return;
        }
        const processedHtml = replaceEnvVars(html);
        res.status(200).set({ "Content-Type": "text/html" }).send(processedHtml);
      });
    } else {
      next();
    }
  });
  
  app.use(express.static(distPath));
  
  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    fs.readFile(indexPath, "utf-8", (err, html) => {
      if (err) {
        res.status(404).send("Not found");
        return;
      }
      const processedHtml = replaceEnvVars(html);
      res.status(200).set({ "Content-Type": "text/html" }).send(processedHtml);
    });
  });
}
