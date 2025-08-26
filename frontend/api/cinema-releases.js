import { getWednesdayForWeek, formatDate, CORS_HEADERS, buildTMDBDiscoverUrl } from "../lib/constants.js";

// API route pour récupérer les prochaines sorties cinéma
export default async function handler(req, res) {
  // CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { page = 1, week = 0 } = req.query;
  const weekOffset = parseInt(week) || 0;

  try {
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
    res.status(200).json({
      success: true,
      data: {
        ...data,
        period: {
          start: startDateStr,
          end: endDateStr,
          isCurrentWeek: startDate.toDateString() === new Date().toDateString()
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des sorties cinéma:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des données",
      message: error.message 
    });
  }
}
