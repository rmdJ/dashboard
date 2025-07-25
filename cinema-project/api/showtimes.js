import { fetchAllPages } from "./helpers.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { cinemaId, dayShift, page } = req.query;

  if (!cinemaId || !dayShift || !page) {
    return res
      .status(400)
      .json({ error: "Paramètres manquants: cinemaId, dayShift, ou page." });
  }

  try {
    const allResults = await fetchAllPages(
      `https://www.allocine.fr/_/showtimes/theater-${cinemaId}/d-${dayShift}`,
      { page }
    );

    const lightedAllResults = allResults.map((result) => ({
      movie: {
        internalId: result.movie.internalId,
        id: result.movie.id,
        poster: result.movie.poster,
        stats: result.movie.stats,
        title: result.movie.title,
        runtime: result.movie.runtime,
        relatedTags: result.movie.relatedTags,
        synopsisFull: result.movie.synopsisFull,
        languages: result.movie.languages,
      },
      showtimes: result.showtimes,
    }));

    res.status(200).json({
      results: lightedAllResults,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données Allociné:",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données Allociné" });
  }
}
