import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vercel-admin-user:njpU1JTwQk62vYG6@cluster0.bzgwoko.mongodb.net/?retryWrites=true&w=majority";
const MONGODB_DB_NAME = "scrapper";

let client;
let dbCache = new Map();

export async function connectDB(dbName = MONGODB_DB_NAME) {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");
  }
  
  if (!dbCache.has(dbName)) {
    dbCache.set(dbName, client.db(dbName));
  }
  
  return dbCache.get(dbName);
}

export function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export async function getSignalData() {
  const database = await connectDB();
  const collection = database.collection("crypto");
  return await collection
    .find({ data: { $exists: true, $type: "array" } })
    .sort({ date: -1 })
    .toArray();
}

export async function getCryptoData() {
  const database = await connectDB();
  const collection = database.collection("crypto");
  return await collection.find({}).toArray();
}

export async function getEvolutionData() {
  const database = await connectDB("finance-front");
  
  // Récupérer les données road-to-10k
  const roadTo10kCollection = database.collection("road-to-10k");
  const roadTo10kData = await roadTo10kCollection
    .find({})
    .sort({ date: 1 })
    .toArray();

  // Récupérer les données road-to-1btc
  const roadTo1btcCollection = database.collection("road-to-1btc");
  const roadTo1btcData = await roadTo1btcCollection
    .find({})
    .sort({ date: 1 })
    .toArray();

  return {
    roadTo10k: roadTo10kData,
    roadTo1btc: roadTo1btcData
  };
}
