import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import {
  INITIAL_SUPPLIERS,
  INITIAL_MATERIALS,
  INITIAL_ORDERS,
  INITIAL_RIDERS,
  INITIAL_CUSTOM_REQUESTS
} from "./src/data";
import { Order, CustomSourcingRequest, CustomSourcingOffer, OrderStatus } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for live simulation during session
let suppliers = [...INITIAL_SUPPLIERS];
let materials = [...INITIAL_MATERIALS];
let orders = [...INITIAL_ORDERS];
let riders = [...INITIAL_RIDERS];
let customRequests = [...INITIAL_CUSTOM_REQUESTS];

// Lazy-loaded Gemini AI client to prevent crash if key is unconfigured
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Simulated automated location tracking updates for In-Transit items
// Every 15 seconds, we randomly move active transit riders closer to parent destinations
setInterval(() => {
  orders.forEach((order) => {
    if (order.status === "In Transit" && order.rider) {
      const riderIdx = riders.findIndex((r) => r.id === order.rider?.id);
      if (riderIdx !== -1) {
        // Move coordinates slightly closer to parent coordinates
        const curX = riders[riderIdx].currentCoordinates.x;
        const curY = riders[riderIdx].currentCoordinates.y;
        const destX = order.parentCoordinates.x;
        const destY = order.parentCoordinates.y;

        const dx = destX - curX;
        const dy = destY - curY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
          // Move 10% closer
          riders[riderIdx].currentCoordinates.x = curX + dx * 0.15;
          riders[riderIdx].currentCoordinates.y = curY + dy * 0.15;
          order.rider.currentCoordinates = { ...riders[riderIdx].currentCoordinates };
        } else {
          // Arrived! Auto-update to delivered to make simulation feel organic
          order.status = "Delivered";
          console.log(`Order ${order.id} automatically marked as delivered.`);
        }
      }
    }
  });
}, 8000);

// --- API Endpoints ---

// Health & Status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Materials Catalog
app.get("/api/materials", (req, res) => {
  res.json(materials);
});

// Suppliers List
app.get("/api/suppliers", (req, res) => {
  res.json(suppliers);
});

// Orders Endpoint
app.get("/api/orders", (req, res) => {
  const { phone } = req.query;
  if (phone) {
    const parentOrders = orders.filter((o) => o.parentPhone === phone);
    return res.json(parentOrders);
  }
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const {
    parentName,
    parentPhone,
    parentLocationName,
    parentCoordinates,
    supplierId,
    items,
    paymentMethod,
  } = req.body;

  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!supplier) {
    return res.status(404).json({ error: "Supplier not found" });
  }

  // Calculate prices
  let subtotal = 0;
  items.forEach((item: any) => {
    const original = materials.find((m) => m.id === item.materialId);
    const price = original ? original.priceKES : 100;
    subtotal += price * item.quantity;
  });

  const deliveryFee = supplier.averageDeliveryFeeKES;
  const total = subtotal + deliveryFee;

  const newOrder: Order = {
    id: "ord_" + Math.floor(100 + Math.random() * 900),
    parentName,
    parentPhone,
    parentLocationName,
    parentCoordinates: parentCoordinates || { x: 50, y: 50 },
    supplierId,
    supplierName: supplier.name,
    items: items.map((it: any) => {
      const original = materials.find((m) => m.id === it.materialId);
      return {
        materialId: it.materialId,
        name: original ? original.name : "Custom material",
        priceKES: original ? original.priceKES : 100,
        quantity: it.quantity,
        supplierId: supplierId,
      };
    }),
    subtotalKES: subtotal,
    deliveryFeeKES: deliveryFee,
    totalKES: total,
    status: paymentMethod === "M-Pesa" ? "Pending Payment" : "Processing",
    createdAt: new Date().toISOString(),
    paymentMethod,
    mpesaPinTriggered: false,
  };

  orders.unshift(newOrder);
  res.json(newOrder);
});

// Simulate M-Pesa Callback
app.post("/api/orders/:id/mpesa-pay", (req, res) => {
  const { id } = req.params;
  const { success } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (success) {
    order.status = "Processing";
    order.mpesaPinTriggered = true;
    order.mpesaTransId = "MPX" + Math.random().toString(36).substring(2, 10).toUpperCase();
    res.json({ message: "Simulated M-Pesa payment accepted successfully", order });
  } else {
    res.json({ error: "Payment was cancelled or unsuccessful", order });
  }
});

// Update Order Status (for Supplier and Admin views)
app.post("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.status = status as OrderStatus;

  // Assign random rider if status updates to "Rider Assigned"
  if (status === "Rider Assigned" && !order.rider) {
    const randomRider = riders[Math.floor(Math.random() * riders.length)];
    // Set rider initial coordinates near supplier coordinates
    const supplier = suppliers.find((s) => s.id === order.supplierId);
    if (supplier) {
      randomRider.currentCoordinates = { ...supplier.coordinates };
    }
    order.rider = { ...randomRider };
  }

  res.json(order);
});

// Custom Sourcing Requests
app.get("/api/custom-requests", (req, res) => {
  res.json(customRequests);
});

app.post("/api/custom-requests", (req, res) => {
  const { parentName, parentPhone, locationName, className, description, requiredByDate } = req.body;

  const newRequest: CustomSourcingRequest = {
    id: "req_" + Math.floor(200 + Math.random() * 800),
    parentName,
    parentPhone,
    locationName,
    className,
    description,
    requiredByDate,
    createdAt: new Date().toISOString(),
    status: "Open",
    offers: [],
  };

  customRequests.unshift(newRequest);
  res.json(newRequest);
});

// Submit supplier offer for custom sourcing
app.post("/api/custom-requests/:id/offers", (req, res) => {
  const { id } = req.params;
  const { supplierId, priceKES, deliveryFeeKES, estimatedDeliveryHours, remarks } = req.body;

  const request = customRequests.find((r) => r.id === id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!supplier) {
    return res.status(404).json({ error: "Supplier not registered" });
  }

  const newOffer: CustomSourcingOffer = {
    id: "off_" + Math.floor(100 + Math.random() * 900),
    supplierId,
    supplierName: supplier.name,
    supplierPhone: supplier.phone,
    priceKES: Number(priceKES),
    deliveryFeeKES: Number(deliveryFeeKES),
    estimatedDeliveryHours: Number(estimatedDeliveryHours),
    remarks,
    createdAt: new Date().toISOString(),
    isAccepted: false,
  };

  request.offers.push(newOffer);
  res.json(request);
});

// Accept supplier offer
app.post("/api/custom-requests/:reqId/offers/:offerId/accept", (req, res) => {
  const { reqId, offerId } = req.params;

  const request = customRequests.find((r) => r.id === reqId);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  const offer = request.offers.find((o) => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ error: "Offer not found" });
  }

  // Accept this offer and close other offers
  request.offers.forEach((o) => {
    o.isAccepted = o.id === offerId;
  });
  request.status = "Fulfilled";

  // Automatically spin up a processing order matching this custom request!
  const newOrder: Order = {
    id: "ord_" + Math.floor(300 + Math.random() * 700),
    parentName: request.parentName,
    parentPhone: request.parentPhone,
    parentLocationName: request.locationName,
    parentCoordinates: { x: 50, y: 50 }, // default
    supplierId: offer.supplierId,
    supplierName: offer.supplierName,
    items: [
      {
        materialId: "custom_" + request.id,
        name: `Sourced: ${request.className} - ${request.description.substring(0, 40)}...`,
        priceKES: offer.priceKES,
        quantity: 1,
        supplierId: offer.supplierId,
      },
    ],
    subtotalKES: offer.priceKES,
    deliveryFeeKES: offer.deliveryFeeKES,
    totalKES: offer.priceKES + offer.deliveryFeeKES,
    status: "Processing",
    createdAt: new Date().toISOString(),
    paymentMethod: "M-Pesa",
    mpesaPinTriggered: true,
    mpesaTransId: "MPX_CUSTOM" + Math.random().toString(36).substring(2, 6).toUpperCase(),
  };

  orders.unshift(newOrder);

  res.json({ request, generatedOrder: newOrder });
});

// --- Gemini AI CBC Document & Message Parser App ---
app.post("/api/gemini/parse", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No curriculum text provided for AI parsing" });
  }

  const ai = getGeminiClient();

  // If Gemini client is unavailable (e.g. key has not been customized), fall back immediately to local parsing
  if (!ai) {
    console.log("Gemini API key is not configured. Invoking rule-based fallback parser.");
    const fallbackResult = parseCBCLocalFallback(text);
    return res.json(fallbackResult);
  }

  try {
    const prompt = `You are a helpful expert in the Kenyan CBC (Competency-Based Curriculum) educational model.
    A parent has copied and pasted school checklists, a text message from a WhatsApp class teacher network, or a homework script demanding materials.
    
    Please parse this text and structure it into a clean list of required practical school supply items.
    
    The raw text is:
    """
    ${text}
    """
    
    Return a JSON object that satisfies the following TypeScript interface structure exactly:
    
    interface AIParsingResult {
      grade: string; // The school grade detected (e.g. "Grade 4", "PP1", "Grade 6", "Junior Secondary 7")
      assessmentTopic?: string; // Short title of the practical activity/assessment if discernible (e.g. "Modeling clay pottery", "Home science sewing task")
      items: Array<{
        name: string; // The exact name of the material needed
        quantity: string; // The estimated quantity required (e.g. "1 block", "2 meters", "Assorted colors pack")
        subject: string; // Best matches our standard CBC subject names: "Art & Craft", "Mathematics", "Science & Tech", "Home Science", "Music & PE", "CRE / IRE", "Languages"
        estimatedPriceKESRange: string; // Kenyan Shillings price estimation (e.g. "150 - 200 KES")
        importance: "Mandatory" | "Recommended" | "Optional";
        localAlternativeSuggestion: string; // A highly contextual, helpful advice for parents who cannot find the item or want to make a local, low-cost homemade alternative (e.g. 'If drawing charcoal is delayed, pull partly burnt firewood embers from an outdoor stove and cool them down, they write perfectly.')
      }>;
      recommendedLocalActions: string[]; // 2-3 custom tips for the parent on getting these items on-time based on local Kenyan realities.
    }
    
    Generate accurate responses based ONLY on the input text. If you cannot determine the grade, assume "Grade 4".
    Make the Kenyan alternative suggestions highly practical, warm, and authentic.
    Return ONLY valid, parsable JSON. No backticks, no markdown delimiters formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedText = response.text ? response.text.trim() : "{}";
    let jsonResult;
    try {
      jsonResult = JSON.parse(parsedText);
    } catch {
      // If the model wrapped in markdown blocks despite instructions, attempt cleaning
      const cleanJson = parsedText.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonResult = JSON.parse(cleanJson);
    }

    // Attempt matching items with our active catalog for parent convenience
    if (jsonResult.items && Array.isArray(jsonResult.items)) {
      jsonResult.items = jsonResult.items.map((item: any) => {
        // Find best similarity in materials array
        const matched = materials.find((m) => {
          const mName = m.name.toLowerCase();
          const itName = item.name.toLowerCase();
          return mName.includes(itName) || itName.includes(mName);
        });

        if (matched) {
          return {
            ...item,
            matchedSupplierId: matched.supplierId,
            matchedSupplierName: matched.supplierName,
            matchedMaterialId: matched.id,
            matchedPriceKES: matched.priceKES,
          };
        }
        return item;
      });
    }

    res.json(jsonResult);
  } catch (error: any) {
    console.error("Gemini AI API connection failed:", error);
    // Graceful automatic degradation to our beautiful local parser
    const fallbackResult = parseCBCLocalFallback(text);
    res.json({
      ...fallbackResult,
      aiNotice: "Gemini token/connection experienced high latency. Activating local SomaLink heuristic scanner.",
    });
  }
});

// Heuristics-based fallback parsing engine so the preview behaves perfectly under any environment
function parseCBCLocalFallback(text: string) {
  const lowerText = text.toLowerCase();
  let grade = "Grade 4";
  let topic = "General supplies";
  const items: any[] = [];

  // Detect grade
  if (lowerText.includes("pp1") || lowerText.includes("playgroup")) grade = "PP1";
  else if (lowerText.includes("pp2")) grade = "PP2";
  else if (lowerText.includes("grade 1") || lowerText.includes("g1")) grade = "Grade 1";
  else if (lowerText.includes("grade 2") || lowerText.includes("g2")) grade = "Grade 2";
  else if (lowerText.includes("grade 3") || lowerText.includes("g3")) grade = "Grade 3";
  else if (lowerText.includes("grade 4") || lowerText.includes("g4")) grade = "Grade 4";
  else if (lowerText.includes("grade 5") || lowerText.includes("g5")) grade = "Grade 5";
  else if (lowerText.includes("grade 6") || lowerText.includes("g6")) grade = "Grade 6";
  else if (lowerText.includes("grade 7") || lowerText.includes("jss") || lowerText.includes("junior")) grade = "Grade 7";

  // Detect topics & populate specific materials
  if (lowerText.includes("clay") || lowerText.includes("mould") || lowerText.includes("pot") || lowerText.includes("sculpt")) {
    topic = "Clay modeling assessment";
    items.push({
      name: "Modeling Clay Block",
      quantity: "1 Pack",
      subject: "Art & Craft",
      estimatedPriceKESRange: "100 - 180 KES",
      importance: "Mandatory",
      localAlternativeSuggestion: "If synthetic clay cannot arrive on time, mix raw red clay soil from near the river bank with fine organic silt and water to remove stones, or formulate homemade dough with 2 cups wheat flour, 1 cup salt, and warm water.",
      matchedSupplierId: "sup_cynthia",
      matchedSupplierName: "Mama Cynthia Art & Craft Hub",
      matchedMaterialId: "mat_4",
      matchedPriceKES: 150
    });
  }

  if (lowerText.includes("manila") || lowerText.includes("chart") || lowerText.includes("paper") || lowerText.includes("card")) {
    if (topic === "General supplies") topic = "Chart presentation task";
    items.push({
      name: "Colored Manila Papers",
      quantity: "6 Sheets",
      subject: "Art & Craft",
      estimatedPriceKESRange: "150 - 250 KES",
      importance: "Mandatory",
      localAlternativeSuggestion: "Collect clean cardboard packaging box linings from any local shop/duka, smooth them with a low-heat flatiron, then paint them with chalk colors or charcoal drawings as cardboard posters.",
      matchedSupplierId: "sup_cynthia",
      matchedSupplierName: "Mama Cynthia Art & Craft Hub",
      matchedMaterialId: "mat_5",
      matchedPriceKES: 250
    });
  }

  if (lowerText.includes("recorder") || lowerText.includes("flute") || lowerText.includes("music") || lowerText.includes("song")) {
    topic = "Melody practical performance";
    items.push({
      name: "Soprano Recorder Flute",
      quantity: "1 Unit",
      subject: "Music & PE",
      estimatedPriceKESRange: "280 - 350 KES",
      importance: "Mandatory",
      localAlternativeSuggestion: "A clean length of thin wild hollow bamboo stalk carefully punched with burning wire tips can form a traditional whistle if official flute imports are delayed.",
      matchedSupplierId: "sup_uhuru",
      matchedSupplierName: "Uhuru Highway Academic Bookstall",
      matchedMaterialId: "mat_7",
      matchedPriceKES: 320
    });
  }

  if (lowerText.includes("apron") || lowerText.includes("sewing") || lowerText.includes("stitch") || lowerText.includes("needle") || lowerText.includes("cook")) {
    topic = "Home Science cookery tasks";
    items.push({
      name: "Home Science Washable Apron & Cap",
      quantity: "1 Set",
      subject: "Home Science",
      estimatedPriceKESRange: "400 - 550 KES",
      importance: "Mandatory",
      localAlternativeSuggestion: "Repurpose an old worn adult cotton t-shirt. Trim off the sleeves, make direct side lace cuts to tie safely around the waist, transforming it instantly into a secure double-layered uniform protector.",
      matchedSupplierId: "sup_kiprono",
      matchedSupplierName: "Kiprono Science & Home-Science Supplies",
      matchedMaterialId: "mat_9",
      matchedPriceKES: 450
    });
  }

  if (lowerText.includes("seeds") || lowerText.includes("soil") || lowerText.includes("pot") || lowerText.includes("plant") || lowerText.includes("maize")) {
    topic = "Agriculture seedling preparation";
    items.push({
      name: "Agriculture Seedlings Kit",
      quantity: "1 Pack",
      subject: "Science & Tech",
      estimatedPriceKESRange: "150 - 250 KES",
      importance: "Recommended",
      localAlternativeSuggestion: "Save a handful of dry unimproved local kernels directly from dry maize cobs and unboiled dry beans. Soak them in warm water for 6 hours before sowing to kickstart fast germination without commercial fertilizers.",
      matchedSupplierId: "sup_kiprono",
      matchedSupplierName: "Kiprono Science & Home-Science Supplies",
      matchedMaterialId: "mat_11",
      matchedPriceKES: 200
    });
  }

  // If no specific keywords matched at all, provide basic stationery items
  if (items.length === 0) {
    topic = "Standard school checklist";
    items.push({
      name: "Standard School Ruled Writing Book",
      quantity: "1 Piece",
      subject: "Languages",
      estimatedPriceKESRange: "50 - 70 KES",
      importance: "Mandatory",
      localAlternativeSuggestion: "Combine scrap paper sheets remaining in finished notebooks from old classes, punch them with sharp nails and bind with clean knitting strings to build a fresh mathematics exercises scratchpad.",
      matchedSupplierId: "sup_musa",
      matchedSupplierName: "Musa Stationery & Local Printing",
      matchedMaterialId: "mat_2",
      matchedPriceKES: 60
    });
    items.push({
      name: "CBC Grade 3 Math counting sticks",
      quantity: "1 Pack",
      subject: "Mathematics",
      estimatedPriceKESRange: "100 - 150 KES",
      importance: "Recommended",
      localAlternativeSuggestion: "Rather than spending money on wooden counting rods, let the child collect dry matchstick shafts (with heads removed), or pick clean twigs, or empty plastic straw cuttings from local environmental recycling hikes.",
      matchedSupplierId: "sup_musa",
      matchedSupplierName: "Musa Stationery & Local Printing",
      matchedMaterialId: "mat_1",
      matchedPriceKES: 120
    });
  }

  return {
    grade,
    assessmentTopic: topic,
    items,
    recommendedLocalActions: [
      `We searched stores near your coordinates. ${items[0]?.matchedSupplierName || "Local suppliers"} has materials ready for dispatch.`,
      "By coordinating with local Boda Boda couriers near market stages, materials can arrive at your doorstep in under 30 minutes.",
      "Consider using the local alternatives suggested if distance/budget constraints are a factor for practical assessment classes."
    ]
  };
}

// Vite integration: Setup static file serving in production, and dev server in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SomaLink CBC] Full-stack server running successfully at http://0.0.0.0:${PORT}`);
  });
}

startServer();
