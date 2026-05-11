import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try to find the public directory in multiple possible locations
  const possiblePaths = [
    path.resolve(__dirname, "public"),
    path.resolve(__dirname, "..", "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public")
  ];

  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    console.error("Static paths searched:", possiblePaths);
    throw new Error(
      `Could not find the build directory with index.html. Make sure to build the client first.`,
    );
  }

  console.log(`[static] Serving files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith("/api")) {
      res.sendFile(path.resolve(distPath, "index.html"));
    } else {
      next();
    }
  });
}
