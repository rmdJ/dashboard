import dotenv from 'dotenv';
import logger from './src/utils/logger.js';
import CronScheduler from './src/schedulers/cronScheduler.js';
import AllocineScraper from './src/scrapers/allocineScraper.js';
import AllocineSimpleScraper from './src/scrapers/allocineSimpleScraper.js';

// Configuration des variables d'environnement
dotenv.config();

class ScraperApp {
  constructor() {
    this.scheduler = new CronScheduler();
  }

  async start() {
    try {
      logger.info('🚀 Démarrage du service de scraping Allociné');
      
      // Obtenir les arguments de la ligne de commande
      const args = process.argv.slice(2);
      const command = args[0];

      switch (command) {
        case 'run':
          // Lancement manuel du scraper
          await this.runManual();
          break;
        case 'schedule':
          // Démarrage du scheduler
          await this.startScheduler();
          break;
        case 'test':
          // Test du scraper sur une seule semaine
          await this.testScraper();
          break;
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      logger.error('💥 Erreur fatale de l\'application', error);
      process.exit(1);
    }
  }

  async runManual() {
    logger.info('🔧 Lancement manuel du scraping');
    const scraper = new AllocineSimpleScraper(); // Utilise le scraper simple par défaut
    const result = await scraper.run();
    
    if (result.success) {
      logger.success(`✅ Scraping terminé: ${result.totalMovies} films scrapés`);
    } else {
      logger.error('❌ Erreur lors du scraping', result.error);
    }
    
    process.exit(result.success ? 0 : 1);
  }

  async startScheduler() {
    logger.info('⏰ Démarrage du scheduler');
    this.scheduler.start();
    
    // Maintenir le processus actif
    process.on('SIGINT', () => {
      logger.info('🛑 Arrêt du scheduler demandé');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('🛑 Arrêt du scheduler demandé');
      process.exit(0);
    });

    logger.info('🔄 Scheduler en cours d\'exécution. Utilisez Ctrl+C pour arrêter.');
  }

  async testScraper() {
    const maxWeeks = process.env.MAX_WEEKS || '3';
    logger.info(`🧪 Test du scraper (${maxWeeks} semaine${maxWeeks > 1 ? 's' : ''} seulement)`);
    
    const scraper = new AllocineSimpleScraper(); // Utilise le scraper simple
    const result = await scraper.run();
    
    if (result.success) {
      logger.success(`✅ Test terminé: ${result.totalMovies} films trouvés`);
      console.log('\n📋 Aperçu des films trouvés:');
      result.movies.slice(0, 5).forEach((movie, index) => {
        console.log(`${index + 1}. ${movie.title} (${movie.releaseDate || 'Date inconnue'})`);
      });
    } else {
      logger.error('❌ Test échoué', result.error);
    }
    
    process.exit(result.success ? 0 : 1);
  }

  showHelp() {
    console.log(`
🎬 Scraper Allociné - Service de récupération des prochaines sorties cinéma

Usage:
  node index.js <command>

Commandes disponibles:
  run       - Lance un scraping manuel immédiatement
  schedule  - Démarre le scheduler pour les scraping automatiques
  test      - Test le scraper sur une seule semaine
  help      - Affiche cette aide

Variables d'environnement (.env):
  MONGODB_URI              - URI de connexion MongoDB
  MONGODB_DB_NAME          - Nom de la base de données
  SCRAPE_CRON_SCHEDULE     - Planning cron (défaut: 0 2 * * * = 2h du matin)
  MAX_WEEKS                - Nombre de semaines à scraper (défaut: 12)
  HEADLESS_MODE            - Mode headless du browser (défaut: true)

Exemples:
  node index.js run        - Scraping immédiat
  node index.js schedule   - Démarrage du scheduler
  node index.js test       - Test rapide
    `);
  }
}

// Démarrage de l'application
const app = new ScraperApp();
app.start();