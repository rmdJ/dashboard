import { fetchAllPages } from "./helpers.js";

// API route pour récupérer les séances d'un cinéma pour une date donnée
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { cinemaId, dayShift = "0", page = "1" } = req.query;

    if (!cinemaId) {
      res.status(400).json({ error: "Cinema ID is required" });
      return;
    }

    // Convertir dayShift en format date si c'est un nombre
    let formattedDayShift = dayShift;
    if (!isNaN(dayShift)) {
      const today = new Date();
      today.setDate(today.getDate() + parseInt(dayShift));
      formattedDayShift = today.toISOString().split("T")[0];
    }

    // Utiliser fetchAllPages pour récupérer toutes les séances
    const allMovies = await fetchAllPages(
      `https://www.allocine.fr/_/showtimes/theater-${cinemaId}/d-${formattedDayShift}`,
      { page: parseInt(page) }
    );

    // Retourner les données dans le même format que le projet original
    // Même si allMovies est vide, c'est un succès (pas d'erreur)
    res.status(200).json({
      success: true,
      data: {
        results: allMovies || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          totalResults: (allMovies || []).length,
        },
        cinemaId,
        dayShift: formattedDayShift,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des séances:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des données",
      message: error.message,
    });
  }
}
