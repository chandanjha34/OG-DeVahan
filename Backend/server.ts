// backend/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
import authRoutes from "./routes/authRoutes";
import bodyParser from "body-parser";
import connectDB from "./config/db";
import {
  uploadFileBuffer,
  uploadJSON,
  fetchJSON,
} from "./utils/contentStorage";
import addServicesRoutes from "./routes/addServicesRoutes";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://og-devahan.vercel.app",
  "https://og-de-vahan.vercel.app",
  "https://og-de-vahan-9t4wtekco-chandan-jhas-projects.vercel.app",
  "https://polvahan-jhachanda-chandan-jhas-projects.vercel.app",
  "https://polvahan-4cknyaqlv-chandan-jhas-projects.vercel.app",
  "https://polvahan-chandan-jhas-projects.vercel.app",
  "https://polvahan-jhachanda-chandan-jhas-projects.vercel.app",
  "https://polvahan.vercel.app",
  "https://devahan.build.half-red.net",
  "https://massa-de-vahan.vercel.app",
  "https://massa-de-vahan-chandan-jhas-projects.vercel.app",
  "https://devahan.xyz",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options(/.*/, cors());

app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.json());

/**
 * AI assistant via Gemini (replaces 0G Compute).
 * Keep /api/ask0GCompute as an alias for older clients.
 */
async function askVehicleAI(req: express.Request, res: express.Response) {
  try {
    const { tokenID, query, serviceRecord } = req.body;
    if (!tokenID || !query || !serviceRecord) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Server missing GEMINI_API_KEY" });
    }

    const prompt = `You are a helpful car service assistant. Use the given vehicle service record to answer queries and provide recommendations. Always answer in less than 4 lines.

Vehicle TokenID: ${tokenID}

Service Record:
${serviceRecord}

Question: ${query}`;

    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No valid response.";

    return res.json({
      reply: answer,
      verified: true,
      provider: "gemini",
      model,
    });
  } catch (error: any) {
    console.error("❌ AI assistant error:", error);
    return res.status(500).json({ error: error.message });
  }
}

app.post("/api/askAI", askVehicleAI);
app.post("/api/ask0GCompute", askVehicleAI); // backward-compatible alias

app.use("/auth", authRoutes);
app.use("/addService", addServicesRoutes);

// ---------------------------
// Content storage routes (SHA-256 blobs; replaces 0G Storage)
// ---------------------------

app.post("/api/uploadFile", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const file = req.files.file as any;
    if (!file.data || !file.name) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid file object" });
    }

    const result = await uploadFileBuffer(file.data, file.name);
    return res.json({
      success: true,
      rootHash: result.rootHash,
      txHash: result.txHash,
    });
  } catch (error: any) {
    console.error("UploadFile error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/uploadJSON", async (req, res) => {
  try {
    const jsonData = req.body;
    if (!jsonData || Object.keys(jsonData).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No JSON data provided" });
    }

    const result = await uploadJSON(jsonData);
    return res.json({
      success: true,
      rootHash: result.rootHash,
      txHash: result.txHash,
    });
  } catch (error: any) {
    console.error("UploadJSON error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/fetchJSON/:rootHash", async (req, res) => {
  try {
    const { rootHash } = req.params;
    if (!rootHash)
      return res
        .status(400)
        .json({ success: false, error: "rootHash is required" });
    const data = await fetchJSON(rootHash);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("FetchJSON error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/IPFS", async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description || !image) {
      return res.json({
        success: false,
        error: "Missing required metadata fields.",
      });
    }

    const pinataJwt = process.env.PINATA_JWT?.trim();
    const pinataApiKey = process.env.PINATA_API_KEY?.trim();
    const pinataApiSecret = process.env.PINATA_API_SECRET?.trim();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Prefer JWT (starts with eyJ…). API key alone is not a JWT and will 403.
    if (pinataJwt && pinataJwt.startsWith("eyJ")) {
      headers.Authorization = `Bearer ${pinataJwt}`;
    } else if (pinataApiKey && pinataApiSecret) {
      headers.pinata_api_key = pinataApiKey;
      headers.pinata_secret_api_key = pinataApiSecret;
    } else {
      console.error(
        "Pinata auth missing/invalid. Set PINATA_JWT (full JWT) or PINATA_API_KEY + PINATA_API_SECRET"
      );
      return res.json({
        success: false,
        error:
          "Server Pinata config invalid. Use a full JWT (eyJ…) or API key + secret.",
      });
    }

    const metadata = { name, description, image };

    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers,
        body: JSON.stringify(metadata),
      }
    );

    if (!pinataResponse.ok) {
      const errBody = await pinataResponse.text();
      throw new Error(
        `Pinata upload failed: ${pinataResponse.status} ${pinataResponse.statusText} ${errBody}`
      );
    }

    const data = await pinataResponse.json();
    const tokenUri = `ipfs://${data.IpfsHash}`;
    return res.json({ success: true, tokenUri });
  } catch (error) {
    if (error instanceof Error) {
      return res.json({ error: error.message });
    }
    return res.json({ error: "Unknown error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
