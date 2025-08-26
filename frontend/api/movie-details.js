// API route pour récupérer les détails d'un film spécifique
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
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: "Movie ID is required" });
      return;
    }

    // API key depuis les variables d'environnement ou la clé fournie
    const apiKey =
      process.env.TMDB_API_KEY || "500872ffa0b37b774999a902d34bdd04";

    // Appel à l'API TMDB pour récupérer les détails du film
    const tmdbUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=fr&region=FR`;

    const response = await fetch(tmdbUrl);

    if (!response.ok) {
      throw new Error(`Erreur API TMDB: ${response.status}`);
    }

    const data = await response.json();

    // Retourner les données
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des données",
      message: error.message,
    });
  }
}
