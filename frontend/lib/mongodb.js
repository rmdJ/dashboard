import { MongoClient } from "mongodb";
import { TMDB_API_KEY, TMDB_BASE_URL, getWednesdayForWeek, formatDate, CORS_HEADERS, buildTMDBDiscoverUrl } from "./constants.js";

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
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
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

export async function getCinemaNextReleases(page = 1, weekOffset = 0) {
  const startDate = getWednesdayForWeek(weekOffset);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Une semaine après

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // Appel à l'API TMDB avec pagination
  const tmdbUrl = buildTMDBDiscoverUrl(startDateStr, endDateStr, page);
  
  const response = await fetch(tmdbUrl);
  
  if (!response.ok) {
    throw new Error(`Erreur API TMDB: ${response.status}`);
  }

  const data = await response.json();

  // Retourner les données avec les informations de période
  return {
    ...data,
    period: {
      start: startDateStr,
      end: endDateStr,
      isCurrentWeek: startDate.toDateString() === new Date().toDateString()
    }
  };
}

export async function getMovieDetails(movieId) {
  // Appel à l'API TMDB pour récupérer les détails du film
  const tmdbUrl = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr`;
  
  const response = await fetch(tmdbUrl);
  
  if (!response.ok) {
    throw new Error(`Erreur API TMDB: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
