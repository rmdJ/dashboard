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

    // ... autres endpoints

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  } catch (error) {
    console.error("API Error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
