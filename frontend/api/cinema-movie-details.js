// API route pour récupérer les détails et séances d'un film dans une zone géographique
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
    const { movieId, zipCode, dayShift = "0" } = req.query;

    if (!movieId || !zipCode) {
      res.status(400).json({ error: "Movie ID and zip code are required" });
      return;
    }

    // URL Allociné pour récupérer les séances d'un film dans une zone
    const allocineUrl = `https://www.allocine.fr/_/showtimes/movie-${movieId}/near-${zipCode}/d-${dayShift}/`;

    const response = await fetch(allocineUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        Referer: "https://www.allocine.fr/",
        "sec-ch-ua":
          '"Not A;Brand";v="99", "Chromium";v="91", "Google Chrome";v="91"',
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API Allociné: ${response.status}`);
    }

    const data = await response.json();

    // Si il y a plusieurs pages, récupérer toutes les pages
    let allTheaters = data.results || [];
    const totalPages = data.pagination?.totalPages || 1;

    // Récupérer les autres pages si nécessaire
    if (totalPages > 1) {
      const pagePromises = [];
      for (let pageNum = 2; pageNum <= Math.min(totalPages, 10); pageNum++) {
        // Limiter à 10 pages max
        const pageUrl = `https://www.allocine.fr/_/showtimes/movie-${movieId}/near-${zipCode}/d-${dayShift}/?page=${pageNum}`;
        pagePromises.push(
          fetch(pageUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              Accept: "application/json, text/plain, */*",
              "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
              Referer: "https://www.allocine.fr/",
            },
          })
            .then((res) => res.json())
            .then((pageData) => pageData.results || [])
        );
      }

      const additionalPages = await Promise.all(pagePromises);
      allTheaters = allTheaters.concat(...additionalPages);
    }

    // Retourner les données consolidées
    res.status(200).json({
      success: true,
      data: {
        movie: data.movie,
        results: allTheaters,
        pagination: data.pagination,
        movieId,
        zipCode,
        dayShift,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des données",
      message: error.message,
    });
  }
}
