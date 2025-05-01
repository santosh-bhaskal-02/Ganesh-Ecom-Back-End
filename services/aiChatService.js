const { GoogleGenAI } = require("@google/genai");
const Product = require("../models/model_product");
const Order = require("../models/model_order");
require("../models/model_orderItem");

async function sendChatMessage({ messages, userId }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      error:
        "GEMINI_API_KEY is not configured on the server. Please add it to your .env file.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Fetch live product catalog from database to provide exact and accurate prices
  let productContext = "";
  try {
    const products = await Product.find({}, "title price size description stock");
    if (products && products.length > 0) {
      productContext = "Here is the exact live catalog of Ganesh Idols currently available in our store:\n" +
        products.map(p => `- ${p.title}: Price: ₹${p.price}, Size: ${p.size} inches, Stock: ${p.stock || 'In Stock'} left`).join("\n");
    } else {
      productContext = "Currently, there are no products in the catalog database.";
    }
  } catch (error) {
    console.error("Failed to retrieve live product context:", error);
    productContext = "Live product data is currently unavailable.";
  }

  // Fetch live user order history and status if logged in
  let orderContext = "";
  if (userId) {
    try {
      const orders = await Order.find({ user: userId })
        .populate({
          path: "orderItems",
          populate: [
            { path: "product", select: "title price" },
            { path: "customProduct", select: "title price" }
          ]
        })
        .sort({ orderDate: -1 });

      if (orders && orders.length > 0) {
        orderContext = "Here is the exact live order status history for this authenticated user (most recent order first):\n" +
          orders.map(o => {
            const items = o.orderItems.map(item => {
              const prod = item.product || item.customProduct;
              return `${prod ? prod.title : 'Idol'} (Qty: ${item.quantity})`;
            }).join(", ");
            return `- Order ID: ${o._id.toString()}, Short ID: #${o._id.toString().slice(-6)}, Status: "${o.status}", Items: [${items}], Total: ₹${o.totalPrice}, Date: ${new Date(o.orderDate).toLocaleDateString()}`;
          }).join("\n");
      } else {
        orderContext = "This user is logged in, but they have not placed any orders yet.";
      }
    } catch (error) {
      console.error("Failed to retrieve live order status context:", error);
      orderContext = "Live order status context is currently unavailable.";
    }
  } else {
    orderContext = "The user is not logged in or authenticated yet. If they ask about their order status, politely ask them to sign in / log in first so you can view their orders.";
  }

  const systemPrompt = [
    "You are the Ganesh Idol Booking assistant.",
    "Help customers with idol booking, delivery, orders, custom idol requests, and general app usage.",
    "Be concise, friendly, and practical.",
    "If you do not know an answer, say so and suggest contacting support or checking the app.",
    "Do not invent order status or prices.",
    "Always use the exact details and prices from the live catalog context below to answer customer queries. Do not make up prices.",
    "Use the exact, live order status history below to answer questions about the user's order status. Citing their order status and short ID (e.g. Order #123456) precisely.",
    productContext,
    orderContext
  ].join("\n\n");

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const modelName = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          reply: {
            type: "STRING",
            description: "The response/reply message to the user.",
          },
        },
        required: ["reply"],
      },
      temperature: 0.7,
    },
  });

  const raw = response.text;

  if (!raw) {
    throw new Error("Empty response from Gemini");
  }

  return JSON.parse(raw);
}

module.exports = {
  sendChatMessage,
};

