import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://vercel-admin-user:njpU1JTwQk62vYG6@cluster0.bzgwoko.mongodb.net/?retryWrites=true&w=majority";

// Films de test avec vraies URLs d'images d'Allociné
const sampleMovies = [
  {
    title: "Test Film avec Image",
    synopsis: "Film de test pour vérifier les images",
    releaseDate: new Date("2025-09-09T22:00:00.000Z"),
    imageUrl: "https://fr.web.img2.acsta.net/c_310_420/pictures/25/08/26/10/17/2550177.jpg", // Une vraie URL d'image Allociné
    director: "Test Director",
    genre: "Drama, Test",
    cast: "Test Actor, Another Actor",
    url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=123456.html",
    movieId: "123456",
    scrapedAt: new Date()
  },
  {
    title: "Adieu Jean-Pat", 
    synopsis: "Un homme part à la recherche de ses origines",
    releaseDate: new Date("2025-09-09T22:00:00.000Z"),
    imageUrl: "https://fr.web.img2.acsta.net/c_310_420/img/4f/99/4f997c99f0e279958d2cd09dcbebd58c.jpg", // L'image de l'exemple donné par l'utilisateur
    director: "François Pirot",
    genre: "Drame",
    cast: "Vincent Dedienne, Sandrine Bonnaire",
    url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=1000012021.html",
    movieId: "1000012021",
    scrapedAt: new Date()
  },
  {
    title: "Film Sans Image",
    synopsis: "Ce film n'a pas d'image pour comparaison",
    releaseDate: new Date("2025-09-10T22:00:00.000Z"),
    imageUrl: null, // Pas d'image
    director: "No Image Director",
    genre: "Test",
    cast: "No Image Actor",
    url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=999999.html",
    movieId: "999999",
    scrapedAt: new Date()
  }
];

async function insertSampleMovies() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("📦 Connexion à MongoDB établie");
    
    const database = client.db("scrapper");
    const collection = database.collection("allocine_movies");
    
    // Supprimer les films de test existants
    await collection.deleteMany({ movieId: { $in: ["123456", "1000012021", "999999"] } });
    console.log("🧹 Films de test supprimés");
    
    // Insérer les nouveaux films de test
    const result = await collection.insertMany(sampleMovies);
    console.log(`✅ ${result.insertedCount} films de test insérés`);
    
    console.log("📊 Films de test insérés:");
    sampleMovies.forEach(movie => {
      console.log(`  - ${movie.title}`);
      console.log(`    Image: ${movie.imageUrl || 'Aucune'}`);
      console.log(`    Date: ${movie.releaseDate.toISOString().split('T')[0]}`);
    });
    
    console.log("\n🔗 Testez maintenant votre frontend sur /cinema/agenda pour voir si les images s'affichent correctement");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion:", error);
  } finally {
    await client.close();
  }
}

insertSampleMovies().catch(console.error);