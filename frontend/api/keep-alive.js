export default async function handler(request, response) {
  // Seulement en GET pour les crons
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiUrl = process.env.VITE_API_URL
      ? `${process.env.VITE_API_URL}/up`
      : "https://dashboard-ut3o.onrender.com/up";

    console.log(`🤖 Pinging ${apiUrl}/up to keep alive...`);

    const startTime = Date.now();
    const apiResponse = await fetch(`${apiUrl}/up`, {
      method: "GET",
      headers: {
        "User-Agent": "Vercel-KeepAlive/1.0",
      },
      // Timeout après 30 secondes
      signal: AbortSignal.timeout(30000),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (apiResponse.ok) {
      const data = await apiResponse.text();

      return response.status(200).json({
        status: "success",
        message: "API pinged successfully",
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        apiStatus: apiResponse.status,
        apiResponse: data.substring(0, 200), // Limite la réponse
      });
    } else {
      return response.status(500).json({
        status: "error",
        message: "API ping failed",
        apiStatus: apiResponse.status,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Keep-alive ping failed:", error);

    return response.status(500).json({
      status: "error",
      message: "Ping failed with exception",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
