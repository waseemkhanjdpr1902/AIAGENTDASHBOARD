import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);

/**
 * Robustly clean API keys from potential environment junk (quotes, prefixes)
 */
const cleanKey = (key: string | undefined): string => {
  if (!key) return "";
  let k = key;
  if (k.includes('=')) {
    k = k.split('=')[1];
  }
  return k.trim().replace(/^["']|["']$/g, '');
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Razorpay Webhook Endpoint
  app.post("/api/razorpay-webhook", express.json(), async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!secret || !signature) {
      console.error("Missing Webhook Secret or Signature");
      return res.status(400).send("Invalid Request");
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Signature Mismatch");
      return res.status(400).send("Unauthorized");
    }

    // Process event
    const { event, payload } = req.body;

    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const description = payment.description?.toLowerCase() || "";
      const email = payment.email;

      let planType: 'pro' | 'practitioner' = 'pro';
      if (description.includes('expert') || description.includes('practitioner')) {
        planType = 'practitioner';
      }

      console.log(`Processing payment for ${email}, Plan: ${planType}`);

      try {
        // Find user by email
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).limit(1).get();

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({
            plan: planType,
            lastPaymentId: payment.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Updated user ${userDoc.id} to ${planType}`);
        } else {
          console.warn(`User with email ${email} not found in Firestore`);
        }
      } catch (error) {
        console.error("Firestore update failed:", error);
      }
    }

    res.status(200).json({ status: "ok" });
  });

  // JSON parsing middleware for other routes
  app.use(express.json({ limit: '20mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from the dist directory in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Catch-all route to serve index.html for SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Check if API key is present
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.warn("WARNING: AI API Key is missing. AI features will fail.");
    } else {
      console.log("AI Configuration detected.");
    }
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
