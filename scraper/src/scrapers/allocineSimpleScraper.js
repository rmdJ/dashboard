import puppeteer from 'puppeteer';
import logger from '../utils/logger.js';
import mongodb from '../database/mongodb.js';
import { 
  cleanText, 
  parseReleaseDate, 
  formatImageUrl, 
  extractMovieId, 
  delay, 
  handleError, 
  validateMovie, 
  getRandomUserAgent 
} from '../utils/helpers.js';

class AllocineSimpleScraper {
  constructor() {
    this.baseUrl = 'https://www.allocine.fr/film/agenda/';
    this.browser = null;
    this.page = null;
    this.maxWeeks = parseInt(process.env.MAX_WEEKS) || 12;
    this.headless = process.env.HEADLESS_MODE !== 'false';
  }

  async init() {
    try {
      logger.info('🚀 Initialisation du scraper Allociné Simple');
      
      this.browser = await puppeteer.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();
      
      await this.page.setUserAgent(getRandomUserAgent());
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['stylesheet', 'font', 'image'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      logger.success('✅ Browser et page initialisés');
      return true;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'initialisation', error);
      return false;
    }
  }

  /**
   * Génère les URLs pour les prochaines semaines basées sur la date courante
   */
  generateWeekUrls() {
    const urls = [];
    const today = new Date();
    
    // Trouver le prochain mercredi (jour de sortie des films)
    const nextWednesday = new Date(today);
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7 || 7;
    nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    
    for (let week = 0; week < this.maxWeeks; week++) {
      const weekDate = new Date(nextWednesday);
      weekDate.setDate(nextWednesday.getDate() + (week * 7));
      
      const year = weekDate.getFullYear();
      const month = String(weekDate.getMonth() + 1).padStart(2, '0');
      const day = String(weekDate.getDate()).padStart(2, '0');
      
      const url = `${this.baseUrl}sem-${year}-${month}-${day}/`;
      urls.push({
        url,
        week: week + 1,
        date: `${day}/${month}/${year}`
      });
    }
    
    return urls;
  }

  async scrapeWeekUrl(weekInfo) {
    try {
      logger.info(`📅 Scraping semaine ${weekInfo.week} (${weekInfo.date})`);
      
      await this.page.goto(weekInfo.url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 45000 
      });
      await delay(3000);

      // Vérifier si la page existe (pas d'erreur 404)
      const pageTitle = await this.page.title();
      if (pageTitle.includes('404') || pageTitle.includes('Erreur')) {
        logger.warn(`⚠️ Page non trouvée pour ${weekInfo.url}`);
        return [];
      }

      // Extraction des films
      const movies = await this.page.evaluate(() => {
        const movieElements = document.querySelectorAll('.card.entity-card.entity-card-list');
        const results = [];

        movieElements.forEach(element => {
          try {
            const titleElement = element.querySelector('.thumbnail .thumbnail-link') || 
                                element.querySelector('.meta-title-link');
            const title = titleElement?.getAttribute('title')?.trim() || 
                         titleElement?.textContent?.trim();
            const url = titleElement?.getAttribute('href');

            if (!title || !url) return;

            const imgElement = element.querySelector('.thumbnail img');
            const imageUrl = imgElement?.src || imgElement?.getAttribute('data-src');

            const dateElement = element.querySelector('.date');
            const releaseDateText = dateElement?.textContent?.trim();

            const genreElement = element.querySelector('.meta-body-info a[href*="genre"]');
            const genre = genreElement?.textContent?.trim();

            const directorElement = element.querySelector('.meta-body-direction a');
            const director = directorElement?.textContent?.trim();

            const castElements = element.querySelectorAll('.meta-body-actor a');
            const cast = Array.from(castElements).map(a => a.textContent.trim()).join(', ');

            const synopsisElement = element.querySelector('.synopsis .content-txt');
            const synopsis = synopsisElement?.textContent?.trim();

            results.push({
              title,
              url: url.startsWith('http') ? url : 'https://www.allocine.fr' + url,
              imageUrl,
              releaseDateText,
              genre,
              synopsis,
              director,
              cast
            });
          } catch (error) {
            console.error('Erreur extraction film:', error);
          }
        });

        return results;
      });

      logger.info(`📝 ${movies.length} films extraits de la semaine ${weekInfo.week}`);
      
      // Traitement des données
      const processedMovies = movies
        .map(movie => this.processMovieData(movie))
        .filter(movie => movie !== null);

      return processedMovies;
    } catch (error) {
      logger.error(`❌ Erreur scraping semaine ${weekInfo.week}`, error);
      return [];
    }
  }

  processMovieData(rawMovie) {
    try {
      const movie = {
        title: cleanText(rawMovie.title),
        url: rawMovie.url,
        imageUrl: formatImageUrl(rawMovie.imageUrl),
        releaseDate: parseReleaseDate(rawMovie.releaseDateText),
        genre: cleanText(rawMovie.genre),
        synopsis: cleanText(rawMovie.synopsis),
        director: cleanText(rawMovie.director),
        cast: cleanText(rawMovie.cast),
        movieId: extractMovieId(rawMovie.url),
        scrapedAt: new Date(),
        source: 'allocine'
      };

      validateMovie(movie);
      return movie;
    } catch (error) {
      logger.warn(`⚠️ Film invalide ignoré: ${rawMovie.title}`, error.message);
      return null;
    }
  }

  async scrapeAllWeeks() {
    const startTime = Date.now();
    let allMovies = [];
    let totalScraped = 0;

    try {
      const weekUrls = this.generateWeekUrls();
      logger.info(`🎬 Début du scraping de ${weekUrls.length} semaines sur Allociné`);

      for (const weekInfo of weekUrls) {
        try {
          const movies = await this.scrapeWeekUrl(weekInfo);
          allMovies = allMovies.concat(movies);
          totalScraped += movies.length;

          logger.info(`✅ Semaine ${weekInfo.week}: ${movies.length} films`);

          // Pause entre les semaines pour éviter la surcharge
          await delay(2000);
        } catch (error) {
          logger.error(`❌ Erreur semaine ${weekInfo.week}`, error);
          continue;
        }
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      logger.success(`🎉 Scraping terminé: ${totalScraped} films en ${duration}s`);

      return allMovies;
    } catch (error) {
      logger.error('❌ Erreur générale lors du scraping', error);
      return allMovies;
    }
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        logger.info('🔒 Browser fermé');
      }
    } catch (error) {
      logger.error('❌ Erreur lors de la fermeture du browser', error);
    }
  }

  async run() {
    try {
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('Impossible d\'initialiser le scraper');
      }

      await mongodb.connect();

      const movies = await this.scrapeAllWeeks();

      if (movies.length > 0) {
        await mongodb.saveMovies(movies);
        
        await mongodb.saveScrapingLog({
          totalMovies: movies.length,
          weeksScraped: this.maxWeeks,
          success: true,
          source: 'allocine',
          scraper: 'simple'
        });
      }

      await mongodb.deleteOldMovies(90);

      logger.success(`🚀 Scraping Allociné Simple terminé avec succès: ${movies.length} films`);
      
      return {
        success: true,
        totalMovies: movies.length,
        movies
      };
    } catch (error) {
      logger.error('💥 Erreur fatale du scraper simple', error);
      
      await mongodb.saveScrapingLog({
        error: error.message,
        success: false,
        source: 'allocine',
        scraper: 'simple'
      });
      
      return handleError(error, 'AllocineSimpleScraper.run');
    } finally {
      await this.close();
      await mongodb.disconnect();
    }
  }
}

export default AllocineSimpleScraper;