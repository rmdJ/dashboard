import {
  setCorsHeaders,
  getSignalData,
  getCryptoData,
  getEvolutionData,
  getCinemaNextReleases,
  getMovieDetails,
} from "../lib/mongodb.js";

export async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.replace("/api", "");

  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    if (pathname === "/crypto" && req.method === "GET") {
      const data = await getCryptoData();
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return;
    }

    if (pathname === "/signal" && req.method === "GET") {
      const data = await getSignalData();
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
      return;
    }

    if (pathname === "/evolution" && req.method === "GET") {
      const data = await getEvolutionData();
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        data: data
      }));
      return;
    }

    if (pathname === "/cinema-releases" && req.method === "GET") {
      const data = await getCinemaNextReleases();
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        data: data
      }));
      return;
    }

    if (pathname.startsWith("/cinema/movie/") && req.method === "GET") {
      const movieId = pathname.split("/").pop();
      const data = await getMovieDetails(movieId);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        data: data
      }));
      return;
    }

    if (pathname === "/movie-details" && req.method === "GET") {
      const movieId = url.searchParams.get('id');
      const data = await getMovieDetails(movieId);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        data: data
      }));
      return;
    }

    if (pathname === "/cinema-showtimes" && req.method === "GET") {
      const cinemaId = url.searchParams.get('cinemaId');
      const dayShift = url.searchParams.get('dayShift') || '0';
      
      try {
        // Utiliser la vraie API cinema-showtimes
        const { fetchAllPages } = await import("../api/helpers.js");
        
        // Convertir dayShift en format date si c'est un nombre
        let formattedDayShift = dayShift;
        if (!isNaN(dayShift)) {
          const today = new Date();
          today.setDate(today.getDate() + parseInt(dayShift));
          formattedDayShift = today.toISOString().split("T")[0];
        }

        const allMovies = await fetchAllPages(
          `https://www.allocine.fr/_/showtimes/theater-${cinemaId}/d-${formattedDayShift}`,
          { page: 1 }
        );

        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          data: {
            results: allMovies,
            cinemaId,
            dayShift
          }
        }));
      } catch (error) {
        console.error('Erreur cinema-showtimes:', error);
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 500;
        res.end(JSON.stringify({
          error: "Erreur lors de la récupération des données",
          message: error.message
        }));
      }
      return;
    }

    if (pathname === "/cinema-movie-details" && req.method === "GET") {
      const movieId = url.searchParams.get('movieId');
      const zipCode = url.searchParams.get('zipCode');
      const dayShift = url.searchParams.get('dayShift') || '0';
      // Pour le développement local, retourner des données mock
      const mockData = {
        movie: { title: "Film test", runtime: "2h", synopsis: "Synopsis test" },
        results: [],
        pagination: { currentPage: 1, totalPages: 1, totalResults: 0 },
        movieId,
        zipCode,
        dayShift
      };
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        data: mockData
      }));
      return;
    }

    // ... autres endpoints

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  } catch (error) {
    console.error("API Error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
