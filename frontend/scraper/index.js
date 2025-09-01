import cron from 'node-cron';
import { scrapeAllocineWithImages } from './src/scrapers/allocineImageFixedScraper.js';

console.log('🚀 Démarrage du service de scraping Allociné avec images fixes');

// Lancer immédiatement le scraping
console.log('▶️ Lancement immédiat du scraping...');
try {
  await scrapeAllocineWithImages();
  console.log('✅ Scraping initial terminé');
} catch (error) {
  console.error('❌ Erreur lors du scraping initial:', error);
}

// Programmer le scraping quotidien à 6h du matin
cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Lancement programmé du scraping (6h du matin)');
  try {
    await scrapeAllocineWithImages();
    console.log('✅ Scraping programmé terminé');
  } catch (error) {
    console.error('❌ Erreur lors du scraping programmé:', error);
  }
});

console.log('🔄 Scheduler en cours d\'exécution. Prochaine exécution: tous les jours à 6h.');
console.log('📊 Statistiques disponibles à: http://localhost:3000/api/cinema/stats');

// Garder le processus actif
process.on('SIGINT', () => {
  console.log('👋 Arrêt du scheduler...');
  process.exit(0);
});