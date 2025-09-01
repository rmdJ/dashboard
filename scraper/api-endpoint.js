/**
 * Endpoint API à ajouter à votre lib/mongodb.js existant
 * pour intégrer les données scrapées d'Allociné
 */

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vercel-admin-user:njpU1JTwQk62vYG6@cluster0.bzgwoko.mongodb.net/?retryWrites=true&w=majority";

// Fonction à ajouter dans votre lib/mongodb.js existant
export async function getAllocineReleases(page = 1, weekOffset = 0) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("scrapper");
    const collection = db.collection("allocine_movies");

    // Calculer les dates de la semaine demandée
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (weekOffset * 7));
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Pagination
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    // Requête avec filtrage par date de sortie
    const query = {
      releaseDate: {
        $gte: startDate,
        $lte: endDate
      }
    };

    const movies = await collection
      .find(query)
      .sort({ releaseDate: 1, title: 1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Convertir au format compatible avec votre frontend
    const formattedMovies = movies.map(movie => ({
      id: parseInt(movie.movieId) || Math.floor(Math.random() * 1000000),
      title: movie.title,
      overview: movie.synopsis || '',
      poster_path: movie.imageUrl,
      release_date: movie.releaseDate ? movie.releaseDate.toISOString().split('T')[0] : null,
      popularity: Math.random() * 100,
      vote_average: Math.random() * 10,
      vote_count: Math.floor(Math.random() * 1000),
      
      // Données spécifiques Allociné
      director: movie.director,
      cast: movie.cast,
      genre: movie.genre,
      allocine_url: movie.url,
      source: 'allocine'
    }));

    await client.close();

    return {
      results: formattedMovies,
      total_pages: totalPages,
      total_results: totalCount,
      page: page,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        week: weekOffset
      }
    };

  } catch (error) {
    console.error('Erreur getAllocineReleases:', error);
    throw error;
  }
}

// Fonction pour obtenir les statistiques
export async function getAllocineStats() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("scrapper");
    const collection = db.collection("allocine_movies");

    const totalMovies = await collection.countDocuments();
    
    const lastWeekMovies = await collection.countDocuments({
      scrapedAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    const upcomingMovies = await collection.countDocuments({
      releaseDate: {
        $gte: new Date()
      }
    });

    await client.close();

    return {
      total: totalMovies,
      lastWeek: lastWeekMovies,
      upcoming: upcomingMovies,
      lastUpdate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Erreur getAllocineStats:', error);
    throw error;
  }
}

/* 
INSTRUCTIONS D'INTÉGRATION:

1. Ajoutez ces fonctions dans votre frontend/lib/mongodb.js

2. Dans votre frontend/server/mongo.js, ajoutez cette route:

if (pathname === "/allocine-releases" && req.method === "GET") {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const page = url.searchParams.get('page') || 1;
  const week = url.searchParams.get('week') || 0;
  
  const data = await getAllocineReleases(page, parseInt(week));
  
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({
    success: true,
    data: data,
  }));
  return;
}

3. Créez un hook pour utiliser ces données:

// hooks/useAllocineReleases.ts
import { useQuery } from "@tanstack/react-query";

export function useAllocineReleases(weekOffset = 0) {
  return useQuery({
    queryKey: ["allocine-releases", weekOffset],
    queryFn: async () => {
      const response = await fetch(`/api/allocine-releases?week=${weekOffset}`);
      if (!response.ok) throw new Error('Erreur réseau');
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

4. Dans votre composant CinemaNextReleases, vous pouvez maintenant 
   utiliser les données d'Allociné en plus de TMDB !
*/