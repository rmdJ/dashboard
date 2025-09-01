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

class AllocineScraper {
  constructor() {
    this.baseUrl = 'https://www.allocine.fr/film/agenda/';
    this.browser = null;
    this.page = null;
    this.maxWeeks = parseInt(process.env.MAX_WEEKS) || 12;
    this.headless = process.env.HEADLESS_MODE !== 'false';
  }

  async init() {
    try {
      logger.info('🚀 Initialisation du scraper Allociné');
      
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
      
      // Configuration de la page
      await this.page.setUserAgent(getRandomUserAgent());
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Bloque les ressources inutiles pour accélérer le scraping
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

  async scrapeWeek(weekNumber = 0) {
    try {
      logger.info(`📅 Scraping de la semaine ${weekNumber + 1}`);
      
      if (weekNumber === 0) {
        // Première semaine - page d'accueil de l'agenda
        try {
          await this.page.goto(this.baseUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
          });
        } catch (error) {
          logger.warn('⚠️ Timeout initial, retry avec domcontentloaded');
          await this.page.goto(this.baseUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
          });
        }
      } else {
        // Pour les semaines suivantes, utilise la navigation
        const navigated = await this.navigateToWeekBySelect(weekNumber);
        if (!navigated) {
          logger.warn(`⚠️ Navigation échouée pour semaine ${weekNumber + 1}, on continue`);
          return []; // Retourner un tableau vide plutôt que de planter
        }
      }
      
      await delay(2000); // Attente pour le chargement complet

      // Extraction des films de la page
      const movies = await this.page.evaluate(() => {
        const movieElements = document.querySelectorAll('.card.entity-card.entity-card-list');
        const results = [];

        movieElements.forEach(element => {
          try {
            // Titre du film depuis le lien dans la figure ou le meta-title
            const titleElement = element.querySelector('.thumbnail .thumbnail-link') || 
                                element.querySelector('.meta-title-link');
            const title = titleElement?.getAttribute('title')?.trim() || 
                         titleElement?.textContent?.trim();
            const url = titleElement?.getAttribute('href');

            if (!title || !url) return;

            // Image de l'affiche
            const imgElement = element.querySelector('.thumbnail img');
            const imageUrl = imgElement?.src || imgElement?.getAttribute('data-src');

            // Date de sortie depuis .date
            const dateElement = element.querySelector('.date');
            const releaseDateText = dateElement?.textContent?.trim();

            // Genre depuis le lien de genre
            const genreElement = element.querySelector('.meta-body-info a[href*="genre"]');
            const genre = genreElement?.textContent?.trim();

            // Réalisateur depuis .meta-body-direction
            const directorElement = element.querySelector('.meta-body-direction a');
            const director = directorElement?.textContent?.trim();

            // Acteurs depuis .meta-body-actor
            const castElements = element.querySelectorAll('.meta-body-actor a');
            const cast = Array.from(castElements).map(a => a.textContent.trim()).join(', ');

            // Synopsis depuis .synopsis .content-txt
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

      logger.info(`📝 ${movies.length} films extraits de la semaine ${weekNumber + 1}`);
      
      // Traitement des données extraites
      const processedMovies = movies
        .map(movie => this.processMovieData(movie))
        .filter(movie => movie !== null);

      // Enrichissement avec les détails de chaque film
      const enrichedMovies = [];
      for (const movie of processedMovies) {
        try {
          const enriched = await this.enrichMovieDetails(movie);
          if (enriched) {
            enrichedMovies.push(enriched);
          }
          await delay(1000); // Pause entre chaque film pour éviter d'être bloqué
        } catch (error) {
          logger.warn(`⚠️ Impossible d'enrichir le film ${movie.title}`, error.message);
          enrichedMovies.push(movie); // On garde le film même sans enrichissement
        }
      }

      return enrichedMovies;
    } catch (error) {
      logger.error(`❌ Erreur lors du scraping de la semaine ${weekNumber + 1}`, error);
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

      // Validation des données minimales
      validateMovie(movie);
      
      return movie;
    } catch (error) {
      logger.warn(`⚠️ Film invalide ignoré: ${rawMovie.title}`, error.message);
      return null;
    }
  }

  async enrichMovieDetails(movie) {
    try {
      // Naviguer vers la page du film pour récupérer plus de détails
      await this.page.goto(movie.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(1500);

      const enrichedData = await this.page.evaluate(() => {
        const result = {};

        // Synopsis complet
        const synopsisElement = document.querySelector('.content-txt, .synopsis .content-txt, #synopsis-details .content-txt');
        if (synopsisElement && synopsisElement.textContent?.trim()) {
          result.synopsis = synopsisElement.textContent.trim();
        }

        // Réalisateur
        const directorElement = document.querySelector('.meta-director .blue-link, .director .blue-link');
        if (directorElement) {
          result.director = directorElement.textContent.trim();
        }

        // Acteurs principaux
        const castElements = document.querySelectorAll('.meta-cast .blue-link, .casting .blue-link');
        if (castElements.length > 0) {
          result.cast = Array.from(castElements)
            .slice(0, 5) // Limite à 5 acteurs principaux
            .map(el => el.textContent.trim())
            .join(', ');
        }

        // Genres
        const genreElements = document.querySelectorAll('.meta-category .blue-link, .category .blue-link');
        if (genreElements.length > 0) {
          result.genres = Array.from(genreElements).map(el => el.textContent.trim());
        }

        // Durée
        const durationElement = document.querySelector('.meta-duration, .duration');
        if (durationElement) {
          result.duration = durationElement.textContent.trim();
        }

        // Note presse et spectateurs
        const pressRatingElement = document.querySelector('.rating-presse .note');
        const userRatingElement = document.querySelector('.rating-users .note, .rating-spectateurs .note');
        
        if (pressRatingElement) {
          result.pressRating = parseFloat(pressRatingElement.textContent.replace(',', '.'));
        }
        
        if (userRatingElement) {
          result.userRating = parseFloat(userRatingElement.textContent.replace(',', '.'));
        }

        return result;
      });

      // Fusionner les données enrichies avec les données de base
      return { ...movie, ...enrichedData };
    } catch (error) {
      logger.warn(`⚠️ Impossible d'enrichir ${movie.title}`, error.message);
      return movie; // Retourner le film sans enrichissement
    }
  }

  async navigateToWeekBySelect(weekNumber) {
    try {
      // Essayer d'abord avec le bouton "Suivante" selon la nouvelle structure
      const nextButton = await this.page.$('.pagination .button.button-right');
      
      if (nextButton) {
        const nextUrl = await nextButton.getAttribute('href');
        if (nextUrl) {
          logger.info(`📅 Navigation vers: ${nextUrl}`);
          try {
            await this.page.goto('https://www.allocine.fr' + nextUrl, { 
              waitUntil: 'domcontentloaded', 
              timeout: 45000 
            });
            await delay(2000);
            return true;
          } catch (error) {
            logger.warn('⚠️ Timeout navigation, retry...');
            await this.page.goto('https://www.allocine.fr' + nextUrl, { 
              waitUntil: 'domcontentloaded', 
              timeout: 45000 
            });
            await delay(2000);
            return true;
          }
        }
      }

      // Fallback : essayer avec le dropdown s'il existe
      const selectElement = await this.page.$('.dropdown-select-inner');
      if (selectElement) {
        const options = await this.page.$$eval('.dropdown-select-inner option', opts => 
          opts.map(opt => ({ 
            value: opt.value, 
            text: opt.textContent.trim(),
            selected: opt.selected 
          }))
        );
        
        if (options.length > 0) {
          const currentIndex = options.findIndex(opt => opt.selected);
          const targetIndex = currentIndex + 1;
          
          if (targetIndex < options.length) {
            const targetOption = options[targetIndex];
            logger.info(`📅 Navigation vers: ${targetOption.text}`);
            
            const targetUrl = 'https://www.allocine.fr' + targetOption.value;
            await this.page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await delay(2000);
            return true;
          }
        }
      }
      
      logger.warn(`⚠️ Impossible de naviguer vers la semaine ${weekNumber + 1}`);
      return false;
      
    } catch (error) {
      logger.warn('⚠️ Erreur navigation', error.message);
      return false;
    }
  }

  async navigateToNextWeek() {
    try {
      // Méthode alternative : cliquer sur le bouton "Suivante"
      const nextButton = await this.page.$('.button.button-md.button-primary-full.button-right');
      
      if (nextButton) {
        await nextButton.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
        await delay(2000);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.warn('⚠️ Impossible de naviguer avec le bouton', error.message);
      return false;
    }
  }

  async scrapeAllWeeks() {
    const startTime = Date.now();
    let allMovies = [];
    let totalScraped = 0;

    try {
      logger.info(`🎬 Début du scraping de ${this.maxWeeks} semaines sur Allociné`);

      for (let week = 0; week < this.maxWeeks; week++) {
        try {
          const movies = await this.scrapeWeek(week);
          allMovies = allMovies.concat(movies);
          totalScraped += movies.length;

          logger.info(`✅ Semaine ${week + 1}: ${movies.length} films`);

          // Pause entre les semaines
          if (week < this.maxWeeks - 1) {
            await delay(3000);
          }
        } catch (error) {
          logger.error(`❌ Erreur semaine ${week + 1}`, error);
          continue; // Continue avec la semaine suivante
        }
      }

      const duration = Math.round((Date.now() - startTime) / 1000);
      logger.success(`🎉 Scraping terminé: ${totalScraped} films en ${duration}s`);

      return allMovies;
    } catch (error) {
      logger.error('❌ Erreur générale lors du scraping', error);
      return allMovies; // Retourner ce qui a été scrapé
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
      // Initialisation
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('Impossible d\'initialiser le scraper');
      }

      // Connexion à la base de données
      await mongodb.connect();

      // Scraping
      const movies = await this.scrapeAllWeeks();

      // Sauvegarde en base
      if (movies.length > 0) {
        await mongodb.saveMovies(movies);
        
        // Log de l'opération
        await mongodb.saveScrapingLog({
          totalMovies: movies.length,
          weeksScraped: this.maxWeeks,
          success: true,
          source: 'allocine'
        });
      }

      // Nettoyage des anciens films
      await mongodb.deleteOldMovies(90);

      logger.success(`🚀 Scraping Allociné terminé avec succès: ${movies.length} films`);
      
      return {
        success: true,
        totalMovies: movies.length,
        movies
      };
    } catch (error) {
      logger.error('💥 Erreur fatale du scraper', error);
      
      // Log de l'erreur
      await mongodb.saveScrapingLog({
        error: error.message,
        success: false,
        source: 'allocine'
      });
      
      return handleError(error, 'AllocineScraper.run');
    } finally {
      await this.close();
      await mongodb.disconnect();
    }
  }
}

export default AllocineScraper;