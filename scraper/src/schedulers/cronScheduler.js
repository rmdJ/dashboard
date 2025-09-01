import cron from 'node-cron';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import AllocineScraper from '../scrapers/allocineScraper.js';

dotenv.config();

class CronScheduler {
  constructor() {
    this.schedule = process.env.SCRAPE_CRON_SCHEDULE || '0 2 * * *'; // Par défaut : 2h du matin chaque jour
    this.isRunning = false;
    this.scraper = new AllocineScraper();
  }

  async runScraping() {
    if (this.isRunning) {
      logger.warn('⚠️ Un scraping est déjà en cours, ignoré');
      return;
    }

    try {
      this.isRunning = true;
      logger.info('🚀 Début du scraping programmé d\'Allociné');

      const result = await this.scraper.run();
      
      if (result.success) {
        logger.success(`✅ Scraping programmé terminé avec succès: ${result.totalMovies} films`);
      } else {
        logger.error('❌ Erreur lors du scraping programmé', result.error);
      }
    } catch (error) {
      logger.error('💥 Erreur fatale lors du scraping programmé', error);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    logger.info(`⏰ Programmation du scraper: ${this.schedule}`);
    
    // Valider le format cron
    if (!cron.validate(this.schedule)) {
      throw new Error(`Format cron invalide: ${this.schedule}`);
    }

    // Programmer la tâche
    cron.schedule(this.schedule, async () => {
      await this.runScraping();
    }, {
      scheduled: true,
      timezone: "Europe/Paris"
    });

    logger.success('✅ Scheduler démarré avec succès');
  }

  // Méthode pour lancer un scraping manuel
  async runManual() {
    logger.info('🔧 Lancement manuel du scraping');
    await this.runScraping();
  }

  // Informations sur le prochain scraping
  getNextRun() {
    // Cette méthode nécessiterait une librairie supplémentaire pour calculer la prochaine exécution
    // Pour l'instant, on retourne juste le schedule
    return this.schedule;
  }
}

export default CronScheduler;