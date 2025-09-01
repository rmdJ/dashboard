import { MongoClient } from "mongodb";
import {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  getWednesdayForWeek,
  formatDate,
  CORS_HEADERS,
  buildTMDBDiscoverUrl,
} from "./constants.js";

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
    roadTo1btc: roadTo1btcData,
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
      isCurrentWeek: startDate.toDateString() === new Date().toDateString(),
    },
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

// Nouvelle fonction pour récupérer les données d'Allociné
export async function getAllocineReleases(page = 1, weekOffset = 0) {
  try {
    const database = await connectDB("scrapper"); // Base où sont stockés les films Allociné
    const collection = database.collection("allocine_movies");

    // Calculer les dates de la semaine demandée  
    const startDate = getWednesdayForWeek(weekOffset);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    // Étendre la fin de période pour inclure le lendemain matin (fuseau horaire)
    const endDateWithBuffer = new Date(endDate);
    endDateWithBuffer.setDate(endDate.getDate() + 1);
    endDateWithBuffer.setHours(23, 59, 59, 999);

    // Pagination
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    // Requête avec filtrage par date de sortie (avec buffer pour fuseau horaire)
    const query = {
      releaseDate: {
        $gte: startDate,
        $lte: endDateWithBuffer,
      },
    };

    const movies = await collection
      .find(query)
      .sort({ releaseDate: 1, title: 1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Filtrer pour ne garder que les films avec des dates dans la bonne semaine
    const filteredMovies = movies.filter(movie => {
      if (!movie.releaseDate) return false;
      
      // Utiliser les dates en format string pour éviter les problèmes de fuseau horaire
      const movieDate = new Date(movie.releaseDate);
      const movieDateStr = formatDate(movieDate);
      
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);
      
      return movieDateStr >= startDateStr && movieDateStr <= endDateStr;
    });

    // Convertir au format compatible avec votre frontend
    const formattedMovies = filteredMovies.map((movie) => ({
      id: parseInt(movie.movieId) || Math.floor(Math.random() * 1000000),
      title: movie.title,
      overview: movie.synopsis || "",
      poster_path: movie.imageUrl || null, // Garder l'URL originale d'Allociné
      release_date: movie.releaseDate ? formatDate(new Date(movie.releaseDate)) : null,
      popularity: Math.random() * 100, // Valeur arbitraire pour le tri
      vote_average: Math.random() * 10,
      vote_count: Math.floor(Math.random() * 1000),
      genre_ids: [], // Allociné utilise des textes de genre

      // Données spécifiques Allociné
      director: movie.director || "Non spécifié",
      cast: movie.cast || "Non spécifié", 
      genre: movie.genre || "Non spécifié",
      allocine_url: movie.url,
      source: "allocine",
      scraped_at: movie.scrapedAt,
    }));

    // Recalculer les totaux basés sur les films filtrés
    const actualTotalResults = formattedMovies.length;
    const actualTotalPages = Math.max(1, Math.ceil(actualTotalResults / pageSize));

    return {
      results: formattedMovies,
      total_pages: actualTotalPages,
      total_results: actualTotalResults,
      page: page,
      period: {
        start: formatDate(startDate),
        end: formatDate(endDate),
        isCurrentWeek: startDate.toDateString() === new Date().toDateString(),
        week: weekOffset,
      },
    };
  } catch (error) {
    console.error("Erreur getAllocineReleases:", error);
    throw error;
  }
}

// Fonction pour obtenir les statistiques Allociné
export async function getAllocineStats() {
  try {
    const database = await connectDB("scrapper");
    const collection = database.collection("allocine_movies");

    const totalMovies = await collection.countDocuments();

    const lastWeekMovies = await collection.countDocuments({
      scrapedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    const upcomingMovies = await collection.countDocuments({
      releaseDate: {
        $gte: new Date(),
      },
    });

    return {
      total: totalMovies,
      lastWeek: lastWeekMovies,
      upcoming: upcomingMovies,
      lastUpdate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erreur getAllocineStats:", error);
    throw error;
  }
}
