/**
 * Utilitaires pour le scraping
 */

/**
 * Nettoie et formate le texte extrait
 */
export function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ').replace(/\n+/g, ' ');
}

/**
 * Extrait la date de sortie et la convertit en format Date
 */
export function parseReleaseDate(dateString) {
  if (!dateString) return null;
  
  // Gère différents formats de dates d'Allociné
  const frenchMonths = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
  };
  
  const cleaned = cleanText(dateString.toLowerCase());
  
  // Format "25 décembre 2024"
  const longFormatMatch = cleaned.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (longFormatMatch) {
    const [, day, month, year] = longFormatMatch;
    const monthNum = frenchMonths[month];
    if (monthNum !== undefined) {
      return new Date(parseInt(year), monthNum, parseInt(day));
    }
  }
  
  // Format "25/12/2024"
  const shortFormatMatch = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (shortFormatMatch) {
    const [, day, month, year] = shortFormatMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  return null;
}

/**
 * Formate l'URL d'image pour s'assurer qu'elle est complète
 */
export function formatImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return 'https://www.allocine.fr' + url;
  return url;
}

/**
 * Extrait l'ID du film depuis l'URL Allociné
 */
export function extractMovieId(url) {
  if (!url) return null;
  const match = url.match(/fichefilm_gen_cfilm=(\d+)/);
  return match ? match[1] : null;
}

/**
 * Pause pour éviter d'être bloqué
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gère les erreurs de manière uniforme
 */
export function handleError(error, context) {
  console.error(`Erreur dans ${context}:`, error.message);
  return {
    success: false,
    error: error.message,
    context
  };
}

/**
 * Valide qu'un objet film a tous les champs requis
 */
export function validateMovie(movie) {
  const required = ['title', 'url', 'releaseDate'];
  const missing = required.filter(field => !movie[field]);
  
  if (missing.length > 0) {
    throw new Error(`Champs manquants: ${missing.join(', ')}`);
  }
  
  return true;
}

/**
 * Génère un user agent aléatoire
 */
export function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];
  
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}