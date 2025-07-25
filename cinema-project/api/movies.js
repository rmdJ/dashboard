import { fetchAllPages } from "./helpers.js";

export default async function handler(req, res) {
  const { movieId, dayShift, zipCode } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    const allResults = await fetchAllPages(
      `https://www.allocine.fr/_/showtimes/movie-${movieId}/near-${zipCode}/d-${dayShift}/`,
      {},
    );

    res.status(200).json({ results: allResults });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données Allociné:",
      error,
    );
    res.status(500).json({ error: "Erreur serveur interne" });
  }
}
