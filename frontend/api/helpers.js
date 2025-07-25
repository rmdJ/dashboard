export const fetchAllPages = async (url, params) => {
  let page = 1;
  let allResults = [];
  let hasMorePages = true;

  while (hasMorePages) {
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
    const data = await response.json();
    allResults = allResults.concat(data.results);

    if (data.pagination && data.pagination.totalPages > page) {
      page++;
    } else {
      hasMorePages = false;
    }
  }

  return allResults;
};
