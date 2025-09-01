import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.uri = process.env.MONGODB_URI;
    this.dbName = process.env.MONGODB_DB_NAME || 'scrapper';
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log(`✅ Connecté à MongoDB - Base: ${this.dbName}`);
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Déconnecté de MongoDB');
    }
  }

  async getCollection(name) {
    if (!this.db) {
      await this.connect();
    }
    return this.db.collection(name);
  }

  // Méthodes spécifiques pour les films d'Allociné
  async saveMovies(movies) {
    const collection = await this.getCollection('allocine_movies');
    
    const bulkOps = movies.map(movie => ({
      updateOne: {
        filter: { url: movie.url },
        update: { 
          $set: { 
            ...movie, 
            lastUpdated: new Date(),
            source: 'allocine'
          } 
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      const result = await collection.bulkWrite(bulkOps);
      console.log(`💾 Sauvegardé: ${result.upsertedCount} nouveaux films, ${result.modifiedCount} mis à jour`);
      return result;
    }
    return null;
  }

  async getMovies(filter = {}) {
    const collection = await this.getCollection('allocine_movies');
    return await collection.find(filter).sort({ releaseDate: 1 }).toArray();
  }

  async getMovieByUrl(url) {
    const collection = await this.getCollection('allocine_movies');
    return await collection.findOne({ url });
  }

  async deleteOldMovies(daysOld = 90) {
    const collection = await this.getCollection('allocine_movies');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await collection.deleteMany({
      releaseDate: { $lt: cutoffDate }
    });
    
    console.log(`🗑️ Supprimé ${result.deletedCount} films anciens (>${daysOld} jours)`);
    return result;
  }

  // Sauvegarde des logs de scraping
  async saveScrapingLog(logData) {
    const collection = await this.getCollection('scraping_logs');
    await collection.insertOne({
      ...logData,
      timestamp: new Date()
    });
  }
}

export default new MongoDB();