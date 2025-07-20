import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

const THRESH_PATH = path.join(
  process.cwd(),
  "public",
  "model",
  "financeai_threshold.json"
);
const MAP_PATH = path.join(
  process.cwd(),
  "public",
  "model",
  "financeai_cat_maps.json"
);

let threshold = 0;
let catMaps: Record<string, Record<string, string>>;

async function loadArtifacts() {
  if (!threshold || !catMaps) {
    try {
      threshold = JSON.parse(await fs.readFile(THRESH_PATH, "utf8")).threshold;
      catMaps = JSON.parse(await fs.readFile(MAP_PATH, "utf8"));
      console.log("[score] artifacts loaded");
    } catch (error) {
      console.error("[score] Failed to load artifacts:", error);
      // Set defaults if files don't exist
      threshold = 0.95;
      catMaps = { merchant: {}, category: {} };
    }
  }
}

/* build the exact 6-element array used in training */
function encode(tx: any): any {
  try {
    const logAmount = Math.log1p(Math.abs(tx.amount));
    // Use a default step value if undefined (hour of day)
    const step = tx.step !== undefined ? tx.step : new Date().getHours();
    const hour = step % 24;

    // Find merchant code - default to 0 if not found
    let merchantCode = 0;
    if (catMaps?.merchant && tx.merchant) {
      const found = Object.entries(catMaps.merchant).find(([, v]) => v === tx.merchant);
      if (found) {
        merchantCode = parseInt(found[0]) || 0;
      }
    }

    // Find category code - default to 0 if not found
    let categoryCode = 0;
    if (catMaps?.category && tx.category) {
      const found = Object.entries(catMaps.category).find(([, v]) => v === tx.category);
      if (found) {
        categoryCode = parseInt(found[0]) || 0;
      }
    }

    // Calculate frequencies - default to 1 if not found
    const merchantFreq = catMaps?.merchant ? 
      Object.values(catMaps.merchant).filter((v) => v === tx.merchant).length || 1 : 1;
    const categoryFreq = catMaps?.category ? 
      Object.values(catMaps.category).filter((v) => v === tx.category).length || 1 : 1;

    return {
      amount: tx.amount,
      step: step,
      merchant_freq: merchantFreq,
      category_freq: categoryFreq,
      merchant_code: merchantCode,
      category_code: categoryCode,
    };
  } catch (error) {
    console.error("[score] Encoding error:", error);
    // Return default values if encoding fails
    return {
      amount: tx.amount || 0,
      step: tx.step || new Date().getHours(),
      merchant_freq: 1,
      category_freq: 1,
      merchant_code: 0,
      category_code: 0,
    };
  }
}

export async function POST(req: NextRequest) {
  await loadArtifacts();
  const tx = await req.json();
  const payload = encode(tx);

  console.log("[score] Sending payload:", payload);

  try {
    const response = await fetch("http://localhost:8000/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[score] FastAPI error:", response.status, response.statusText, errorText);
      return Response.json({ prob: null, isAnomaly: false, features: payload });
    }

    const { prob } = await response.json();
    
    if (prob === null || prob === undefined) {
      console.error("[score] null probability from FastAPI");
      return Response.json({ prob: null, isAnomaly: false, features: payload });
    }

    return Response.json({ 
      prob, 
      isAnomaly: prob >= threshold,
      features: payload
    });
  } catch (error) {
    console.error("[score] fetch error:", error);
    return Response.json({ prob: null, isAnomaly: false, features: payload });
  }
}
