export const fetchAllPages = async (url, params) => {
  let page = 1;
  let allResults = [];
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const response = await fetch(
        `${url}?${new URLSearchParams({ ...params, page, version: "DUBBED" })}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "application/json",
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            Referer: "https://www.allocine.fr/",
          },
        }
      );

      if (!response.ok) {
        // Si c'est une 404 ou similaire, retourner un tableau vide plutôt qu'une erreur
        if (response.status === 404 || response.status === 400) {
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Vérifier si data.results existe avant de l'utiliser
      if (data.results && Array.isArray(data.results)) {
        allResults = allResults.concat(data.results);
      }

      if (data.pagination && data.pagination.totalPages > page) {
        page++;
      } else {
        hasMorePages = false;
      }
    } catch (error) {
      // Pour les erreurs de parsing JSON ou réseau, retourner tableau vide pour ce cinéma
      console.warn(`Erreur pour ${url}, page ${page}:`, error.message);
      return [];
    }
  }

  return allResults;
};
