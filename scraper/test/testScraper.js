import AllocineScraper from '../src/scrapers/allocineScraper.js';
import mongodb from '../src/database/mongodb.js';
import logger from '../src/utils/logger.js';

async function testScraper() {
  try {
    logger.info('🧪 Test du scraper Allociné');
    
    // Configuration de test (1 seule semaine)
    process.env.MAX_WEEKS = '1';
    process.env.HEADLESS_MODE = 'false'; // Mode visible pour debug
    
    // Connexion à la base de données
    await mongodb.connect();
    
    // Test du scraper
    const scraper = new AllocineScraper();
    const result = await scraper.run();
    
    if (result.success) {
      logger.success(`✅ Test réussi: ${result.totalMovies} films trouvés`);
      
      // Affichage des résultats
      console.log('\n📋 Films trouvés:');
      result.movies.forEach((movie, index) => {
        console.log(`\n${index + 1}. ${movie.title}`);
        console.log(`   📅 Date: ${movie.releaseDate || 'Inconnue'}`);
        console.log(`   🎭 Genre: ${movie.genre || 'Non spécifié'}`);
        console.log(`   🎬 Réalisateur: ${movie.director || 'Non spécifié'}`);
        console.log(`   🎭 Acteurs: ${(movie.cast || 'Non spécifiés').substring(0, 100)}...`);
        console.log(`   📖 Synopsis: ${(movie.synopsis || 'Non disponible').substring(0, 150)}...`);
        console.log(`   🔗 URL: ${movie.url}`);
      });
      
      // Test de sauvegarde en base
      logger.info('💾 Test de sauvegarde en base de données...');
      const saved = await mongodb.saveMovies(result.movies);
      logger.success(`✅ Sauvegarde réussie: ${saved.upsertedCount} nouveaux, ${saved.modifiedCount} mis à jour`);
      
      // Test de lecture depuis la base
      logger.info('📖 Test de lecture depuis la base...');
      const moviesFromDB = await mongodb.getMovies();
      logger.success(`✅ Lecture réussie: ${moviesFromDB.length} films en base`);
      
    } else {
      logger.error('❌ Test échoué', result.error);
    }
    
    await mongodb.disconnect();
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    logger.error('💥 Erreur lors du test', error);
    await mongodb.disconnect();
    process.exit(1);
  }
}

// Lancement du test
testScraper();