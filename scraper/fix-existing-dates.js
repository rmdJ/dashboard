import { MongoClient } from "mongodb";
import { parseReleaseDate } from './src/utils/helpers.js';

const MONGODB_URI = "mongodb+srv://vercel-admin-user:njpU1JTwQk62vYG6@cluster0.bzgwoko.mongodb.net/?retryWrites=true&w=majority";

async function fixExistingDates() {
  console.log("🔧 Correction des dates existantes en base");
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("📦 Connexion à MongoDB établie");
    
    const database = client.db("scrapper");
    const collection = database.collection("allocine_movies");
    
    // Récupérer tous les films avec une date de release incorrecte
    const movies = await collection.find({}).toArray();
    
    console.log(`📋 ${movies.length} films trouvés en base`);
    
    let correctedCount = 0;
    const corrections = [];
    
    for (const movie of movies) {
      if (!movie.title) continue;
      
      const currentDate = movie.releaseDate;
      if (!currentDate) continue;
      
      // Vérifier si la date actuelle se termine par "T22:00:00.000Z" (notre nouveau format)
      const currentDateStr = currentDate.toISOString();
      
      // Si ce n'est pas déjà au bon format, et si on peut retrouver la date originale
      if (!currentDateStr.endsWith('T22:00:00.000Z')) {
        // Essayer de reconstituer la date à partir du titre ou d'autres infos
        // Pour cet exemple, on va corriger manuellement les dates connues
        
        const currentLocalDate = currentDateStr.split('T')[0]; // Ex: "2025-09-23"
        const dateParts = currentLocalDate.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);
        
        // Si la date semble être décalée d'un jour (probablement à cause du fuseau horaire)
        // On ajoute un jour pour corriger
        if (currentDateStr.includes('T22:00:00.000+00:00') || currentDateStr.includes('T23:00:00.000Z')) {
          const correctedDate = new Date(Date.UTC(year, month - 1, day + 1, 22, 0, 0));
          
          corrections.push({
            title: movie.title,
            oldDate: currentDateStr,
            newDate: correctedDate.toISOString(),
            movieId: movie._id
          });
          
          // Mettre à jour en base
          await collection.updateOne(
            { _id: movie._id },
            { $set: { releaseDate: correctedDate } }
          );
          
          correctedCount++;
        }
      }
    }
    
    console.log(`✅ ${correctedCount} dates corrigées`);
    
    if (corrections.length > 0) {
      console.log("\n📝 Corrections effectuées :");
      corrections.slice(0, 5).forEach(correction => {
        console.log(`  - ${correction.title}:`);
        console.log(`    Avant: ${correction.oldDate}`);
        console.log(`    Après: ${correction.newDate}`);
      });
      
      if (corrections.length > 5) {
        console.log(`    ... et ${corrections.length - 5} autres`);
      }
    }
    
    // Vérifier spécifiquement le film "une bataill apres l'autre"
    const batailleFilm = await collection.findOne({ 
      title: { $regex: /bataille.*autre/i } 
    });
    
    if (batailleFilm) {
      console.log(`\n🎯 Film "Une bataille après l'autre" :`);
      console.log(`  - Date actuelle: ${batailleFilm.releaseDate.toISOString()}`);
      console.log(`  - Date locale: ${batailleFilm.releaseDate.toISOString().split('T')[0]}`);
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await client.close();
  }
}

fixExistingDates().catch(console.error);