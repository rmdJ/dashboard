import { MongoClient } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://vercel-admin-user:njpU1JTwQk62vYG6@cluster0.bzgwoko.mongodb.net/?retryWrites=true&w=majority";
const MONGODB_DB_NAME = "scrapper";

let client;
let db;

async function connectDB() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    console.log("Connected to MongoDB");
  }
  return db;
}

export async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace("/api", "");

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const database = await connectDB();

    if (pathname === "/crypto" && req.method === "GET") {
      const collection = database.collection("crypto");
      const data = await collection.find({}).toArray();
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return;
    }

    if (pathname.startsWith("/crypto/") && req.method === "GET") {
      const collection = database.collection("crypto");
      const id = pathname.split("/").pop();
      if (id === "search") {
        const symbol = url.searchParams.get("symbol");
        if (!symbol) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Symbol parameter required" }));
          return;
        }
        const data = await collection.find({
          $or: [
            { symbol: { $regex: symbol, $options: "i" } },
            { name: { $regex: symbol, $options: "i" } },
          ],
        }).toArray();
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(data));
        return;
      } else {
        const data = await collection.findOne({ _id: id });
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(data));
        return;
      }
    }

    if (pathname === "/signal" && req.method === "GET") {
      const collection = database.collection("crypto");
      // Filtrer seulement les documents qui ont un tableau 'data' (format signal)
      const data = await collection.find({ 
        data: { $exists: true, $type: "array" } 
      }).sort({ date: -1 }).toArray();
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  } catch (error) {
    console.error("API Error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
