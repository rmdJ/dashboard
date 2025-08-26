// Constantes partagées entre les différents environnements

export const TMDB_API_KEY =
  process.env.TMDB_API_KEY || "500872ffa0b37b774999a902d34bdd04";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Fonction utilitaire partagée pour calculer le prochain mercredi
export const getNextWednesday = () => {
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

// Fonction pour calculer le mercredi d'une semaine donnée (0 = prochaine semaine, 1 = semaine +1, etc.)
export const getWednesdayForWeek = (weekOffset = 0) => {
  const nextWednesday = getNextWednesday();
  const targetWednesday = new Date(nextWednesday);
  targetWednesday.setDate(nextWednesday.getDate() + weekOffset * 7);
  return targetWednesday;
};

// Fonction utilitaire pour construire l'URL TMDB avec pagination
export const buildTMDBDiscoverUrl = (startDateStr, endDateStr, page = 1) => {
  return `${TMDB_BASE_URL}/discover/movie?region=fr&language=fr&primary_release_date.gte=${startDateStr}&primary_release_date.lte=${endDateStr}&api_key=${TMDB_API_KEY}&page=${page}`;
};

// Fonction utilitaire pour formatter une date
export const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

// Configuration CORS partagée
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
