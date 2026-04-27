import express from "express";
import path from "path";
import fs from "fs";
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

type ServerFirebaseConfig = FirebaseOptions & {
  firestoreDatabaseId?: string;
};

function loadFirebaseConfig(): ServerFirebaseConfig {
  const configFromEnv: ServerFirebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID,
  };

  if (configFromEnv.projectId && configFromEnv.apiKey && configFromEnv.appId) {
    console.log("[firebase.server] Loaded Firebase config from env");
    return configFromEnv;
  }

  const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      "firebase-applet-config.json file is missing. Check the deployed package or FIREBASE_* environment variables.",
    );
  }

  console.log("[firebase.server] Loaded Firebase config from json", { configPath });
  const rawConfig = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(rawConfig) as ServerFirebaseConfig;
}

const firebaseConfig = loadFirebaseConfig();
const firebaseApp = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

const distPath = path.resolve(process.cwd(), "dist");
const distIndexPath = path.join(distPath, "index.html");
const sourceIndexPath = path.resolve(process.cwd(), "index.html");
const hasBuiltClient = fs.existsSync(distIndexPath);
const isCloudRun = Boolean(process.env.K_SERVICE);
const isNodeProduction = process.env.NODE_ENV === "production";
const useBuiltClient = hasBuiltClient && (isCloudRun || isNodeProduction);
const PORT = Number(process.env.PORT || 8080);

type SeoRequest = express.Request & { seoHtml?: string };

async function startServer() {
  const app = express();

  console.log("[boot] Starting CastFolio server", {
    port: PORT,
    nodeEnv: process.env.NODE_ENV ?? "undefined",
    isCloudRun,
    hasBuiltClient,
    useBuiltClient,
    cwd: process.cwd(),
  });

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      port: PORT,
      mode: useBuiltClient ? "built-client" : "vite-middleware",
      isCloudRun,
      hasBuiltClient,
    });
  });

  app.get("/p/:slug", async (req, res, next) => {
    try {
      const { slug } = req.params;
      const q = query(collection(db, "pages"), where("slug", "==", slug), where("isPublished", "==", true));
      const snapshot = await getDocs(q);

      const htmlSourcePath = useBuiltClient ? distIndexPath : sourceIndexPath;
      let html = fs.readFileSync(htmlSourcePath, "utf-8");

      if (!snapshot.empty) {
        const pageData = snapshot.docs[0].data();
        if (pageData.isPublished && pageData.status === "published") {
          const fallbackName =
            pageData.content?.hero?.nameKo ||
            pageData.content?.hero?.nameEn ||
            "CastFolio";
          const title = pageData.seo?.title || `${fallbackName} | 포트폴리오`;
          const description =
            pageData.seo?.description ||
            pageData.content?.hero?.tagline ||
            "포트폴리오입니다.";
          const imageUrl =
            pageData.seo?.imageUrl || pageData.content?.hero?.photoUrl || "";

          html = html.replace(/<title>(.*?)<\/title>/, `<title>${title}</title>`);

          const metaTags = `
            <meta name="description" content="${description}" />
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${imageUrl}" />
          `;

          html = html.replace("</head>", `${metaTags}</head>`);
        }
      }

      if (!useBuiltClient) {
        (req as SeoRequest).seoHtml = html;
        next();
        return;
      }

      res.send(html);
    } catch (error) {
      console.error("[route:/p/:slug] Error serving public page:", error);
      next(error);
    }
  });

  if (!useBuiltClient) {
    console.log("[boot] Using Vite middleware server");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(async (req, res, next) => {
      const requestWithSeo = req as SeoRequest;
      if (requestWithSeo.seoHtml) {
        try {
          const transformedHtml = await vite.transformIndexHtml(
            req.url,
            requestWithSeo.seoHtml,
          );
          res.send(transformedHtml);
          return;
        } catch (error) {
          vite.ssrFixStacktrace(error as Error);
          next(error);
          return;
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    console.log("[boot] Using built dist client", { distIndexPath });
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(distIndexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[boot] Server running on http://0.0.0.0:${PORT} (${useBuiltClient ? "built-client" : "vite-middleware"})`,
    );
  });
}

startServer().catch((error) => {
  console.error("[boot] Failed to start server:", error);
  process.exit(1);
});
