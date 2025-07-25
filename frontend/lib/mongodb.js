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

export async function getCinemaNextReleases() {
  // Calculer la date du prochain mercredi ou aujourd'hui si c'est mercredi
  const getNextWednesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = dimanche, 3 = mercredi
    
    if (dayOfWeek === 3) {
      // Si c'est mercredi, on retourne aujourd'hui
      return today;
    } else if (dayOfWeek < 3) {
      // Si on est avant mercredi, on va au mercredi de cette semaine
      const daysUntilWednesday = 3 - dayOfWeek;
      const nextWednesday = new Date(today);
      nextWednesday.setDate(today.getDate() + daysUntilWednesday);
      return nextWednesday;
    } else {
      // Si on est après mercredi, on va au mercredi de la semaine suivante
      const daysUntilNextWednesday = 7 - dayOfWeek + 3;
      const nextWednesday = new Date(today);
      nextWednesday.setDate(today.getDate() + daysUntilNextWednesday);
      return nextWednesday;
    }
  };

  const startDate = getNextWednesday();
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Une semaine après

  // Formatter les dates pour l'API TMDB
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  // API key depuis les variables d'environnement ou la clé fournie
  const apiKey = process.env.TMDB_API_KEY || "500872ffa0b37b774999a902d34bdd04";
  
  // Appel à l'API TMDB
  const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?region=FR&language=fr&primary_release_date.gte=${startDateStr}&primary_release_date.lte=${endDateStr}&api_key=${apiKey}`;
  
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
  // API key depuis les variables d'environnement ou la clé fournie
  const apiKey = process.env.TMDB_API_KEY || "500872ffa0b37b774999a902d34bdd04";
  
  // Appel à l'API TMDB pour récupérer les détails du film
  const tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=fr`;
  
  const response = await fetch(tmdbUrl);
  
  if (!response.ok) {
    throw new Error(`Erreur API TMDB: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
