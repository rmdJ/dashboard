import mongodb from '../database/mongodb.js';
import logger from './logger.js';

/**
 * Utilitaire pour intégrer les données scrapées avec votre frontend
 * Convertit les données Allociné au format attendu par votre API existante
 */

class FrontendIntegration {
  
  /**
   * Convertit les films scrapés au format TMDB-like pour compatibilité
   */
  async convertToTMDBFormat() {
    try {
      const allocineMovies = await mongodb.getMovies();
      
      const tmdbFormatMovies = allocineMovies.map(movie => ({
        // Format compatible avec votre API existante
        id: parseInt(movie.movieId) || Math.floor(Math.random() * 1000000),
        title: movie.title,
        overview: movie.synopsis || '',
        poster_path: movie.imageUrl ? movie.imageUrl.replace('https://fr.web.img2.acsta.net', '') : null,
        release_date: movie.releaseDate ? movie.releaseDate.toISOString().split('T')[0] : null,
        genre_ids: this.mapGenreToIds(movie.genre),
        popularity: Math.random() * 100, // Valeur arbitraire
        vote_average: Math.random() * 10,
        vote_count: Math.floor(Math.random() * 1000),
        adult: false,
        backdrop_path: null,
        original_language: 'fr',
        original_title: movie.title,
        video: false,
        
        // Champs spécifiques Allociné
        allocine_url: movie.url,
        director: movie.director,
        cast: movie.cast ? movie.cast.split(', ') : [],
        source: 'allocine',
        scraped_at: movie.scrapedAt
      }));

      return tmdbFormatMovies;
    } catch (error) {
      logger.error('Erreur conversion format TMDB', error);
      return [];
    }
  }

  /**
   * Mappe les genres français vers des IDs
   */
  mapGenreToIds(genre) {
    const genreMapping = {
      'Action': [28],
      'Aventure': [12],
      'Animation': [16],
      'Comédie': [35],
      'Crime': [80],
      'Documentaire': [99],
      'Drame': [18],
      'Famille': [10751],
      'Fantastique': [14],
      'Histoire': [36],
      'Horreur': [27],
      'Musique': [10402],
      'Mystère': [9648],
      'Romance': [10749],
      'Science-Fiction': [878],
      'Thriller': [53],
      'Guerre': [10752],
      'Western': [37]
    };

    if (!genre) return [];
    return genreMapping[genre] || [18]; // Défaut: Drame
  }

  /**
   * Sauvegarde les films au format compatible dans une collection séparée
   */
  async saveForFrontend() {
    try {
      const tmdbMovies = await this.convertToTMDBFormat();
      
      if (tmdbMovies.length === 0) {
        logger.warn('Aucun film à sauvegarder pour le frontend');
        return;
      }

      const collection = await mongodb.getCollection('allocine_movies_frontend');
      
      // Supprime les anciens films et insert les nouveaux
      await collection.deleteMany({});
      await collection.insertMany(tmdbMovies);
      
      logger.success(`✅ ${tmdbMovies.length} films sauvegardés pour le frontend`);
      
      return tmdbMovies;
    } catch (error) {
      logger.error('Erreur sauvegarde frontend', error);
      throw error;
    }
  }

  /**
   * Génère des statistiques pour le monitoring
   */
  async getStats() {
    try {
      const collection = await mongodb.getCollection('allocine_movies');
      
      const totalMovies = await collection.countDocuments();
      const todayMovies = await collection.countDocuments({
        scrapedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      });

      const genreStats = await collection.aggregate([
        { $match: { genre: { $exists: true, $ne: null } } },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

      const releaseStats = await collection.aggregate([
        { $match: { releaseDate: { $exists: true, $ne: null } } },
        { $group: { 
          _id: { 
            year: { $year: '$releaseDate' },
            month: { $month: '$releaseDate' }
          }, 
          count: { $sum: 1 } 
        } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]).toArray();

      return {
        totalMovies,
        todayMovies,
        genres: genreStats,
        releases: releaseStats,
        lastUpdate: new Date()
      };
    } catch (error) {
      logger.error('Erreur génération stats', error);
      return null;
    }
  }
}

export default new FrontendIntegration();