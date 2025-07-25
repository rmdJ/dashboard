// API route pour récupérer les prochaines sorties cinéma
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
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
    // Calculer la date du prochain mercredi ou aujourd'hui si c'est mercredi
    const getNextWednesday = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = dimanche, 3 = mercredi
      
      if (dayOfWeek === 3) {
        // Si c'est mercredi, on retourne aujourd'hui
        return today;
      } else if (dayOfWeek < 3) {
        // Si on est avant mercredi, on va au mercredi de cette semaine
        const daysUntilWednesday = 3 - dayOfWeek;
        const nextWednesday = new Date(today);
        nextWednesday.setDate(today.getDate() + daysUntilWednesday);
        return nextWednesday;
      } else {
        // Si on est après mercredi, on va au mercredi de la semaine suivante
        const daysUntilNextWednesday = 7 - dayOfWeek + 3;
        const nextWednesday = new Date(today);
        nextWednesday.setDate(today.getDate() + daysUntilNextWednesday);
        return nextWednesday;
      }
    };

    const startDate = getNextWednesday();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Une semaine après

    // Formatter les dates pour l'API TMDB
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // API key depuis les variables d'environnement ou la clé fournie
    const apiKey = process.env.TMDB_API_KEY || "500872ffa0b37b774999a902d34bdd04";
    
    // Appel à l'API TMDB
    const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?region=FR&language=fr&primary_release_date.gte=${startDateStr}&primary_release_date.lte=${endDateStr}&api_key=${apiKey}`;
    
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
