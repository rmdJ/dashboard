import puppeteer from "puppeteer";
import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://vercel-admin-user:njpU1JTwQk62vYG6@cluster0.bzgwoko.mongodb.net/?retryWrites=true&w=majority";

// Générer les URLs des semaines à scraper
function generateWeekUrls() {
  const urls = [];
  const baseUrl = "https://www.allocine.fr/film/agenda/sem-";
  
  // Générer 12 semaines (3 mois)
  for (let week = 0; week < 12; week++) {
    urls.push(`${baseUrl}${week}/`);
  }
  
  return urls;
}

// Fonction pour attendre que les images soient chargées
async function waitForImages(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const images = document.querySelectorAll('img.thumbnail-img');
      let loadedCount = 0;
      const totalImages = images.length;
      
      if (totalImages === 0) {
        resolve();
        return;
      }
      
      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === totalImages) resolve();
        } else {
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImages) resolve();
          };
        }
      });
      
      // Timeout après 5 secondes
      setTimeout(resolve, 5000);
    });
  });
}

// Scraper principal
export async function scrapeAllocineWithImages() {
  console.log("🎬 Démarrage du scraper Allociné avec images corrigées");
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Configuration de la page
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  
  const allMovies = [];
  const weekUrls = generateWeekUrls();
  
  console.log(`📅 Scraping ${weekUrls.length} semaines...`);
  
  for (const url of weekUrls) {
    try {
      console.log(`🔍 Scraping: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Attendre que les images soient chargées
      await waitForImages(page);
      
      // Attendre un peu plus pour s'assurer que tout est chargé
      await page.waitForTimeout(2000);
      
      const movies = await page.evaluate(() => {
        const movieElements = document.querySelectorAll('.card.entity-card.entity-card-list.cf');
        const moviesData = [];
        
        movieElements.forEach((element) => {
          try {
            // Titre
            const titleElement = element.querySelector('.meta-title a');
            const title = titleElement ? titleElement.textContent.trim() : 'Non spécifié';
            
            // URL du film
            const movieUrl = titleElement ? `https://www.allocine.fr${titleElement.getAttribute('href')}` : null;
            
            // ID du film depuis l'URL
            let movieId = null;
            if (movieUrl) {
              const match = movieUrl.match(/cfilm=(\d+)/);
              movieId = match ? match[1] : null;
            }
            
            // Synopsis
            const synopsisElement = element.querySelector('.synopsis');
            const synopsis = synopsisElement ? synopsisElement.textContent.trim() : 'Non spécifié';
            
            // Date de sortie
            const releaseDateElement = element.querySelector('.date');
            let releaseDate = null;
            if (releaseDateElement) {
              const dateText = releaseDateElement.textContent.trim();
              const dateMatch = dateText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
              if (dateMatch) {
                const [, day, month, year] = dateMatch;
                const monthMap = {
                  'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
                  'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
                  'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
                };
                const monthNum = monthMap[month.toLowerCase()] || '01';
                releaseDate = new Date(`${year}-${monthNum}-${day.padStart(2, '0')}T22:00:00.000Z`);
              }
            }
            
            // Image - Récupérer la vraie URL de l'image
            let imageUrl = null;
            const imgElement = element.querySelector('.thumbnail-container img.thumbnail-img');
            if (imgElement) {
              const src = imgElement.getAttribute('src');
              // Vérifier que ce n'est pas un placeholder data:image
              if (src && !src.startsWith('data:image')) {
                imageUrl = src;
              } else {
                // Si c'est un placeholder, essayer de récupérer la vraie URL depuis data-src ou autres attributs
                const dataSrc = imgElement.getAttribute('data-src') || 
                              imgElement.getAttribute('data-lazy-src') ||
                              imgElement.getAttribute('data-original');
                if (dataSrc && !dataSrc.startsWith('data:image')) {
                  imageUrl = dataSrc;
                }
              }
            }
            
            // Réalisateur
            const directorElement = element.querySelector('.meta-body .credits .dark-grey-link');
            const director = directorElement ? directorElement.textContent.trim() : 'Non spécifié';
            
            // Genre
            const genreElements = element.querySelectorAll('.meta-body .genre');
            const genres = Array.from(genreElements).map(g => g.textContent.trim()).join(', ');
            const genre = genres || 'Non spécifié';
            
            // Cast (acteurs)
            const castElements = element.querySelectorAll('.meta-body .credits .dark-grey-link');
            const castArray = Array.from(castElements).slice(1); // Skip director (first one)
            const cast = castArray.map(c => c.textContent.trim()).join(', ') || 'Non spécifié';
            
            if (title && title !== 'Non spécifié') {
              moviesData.push({
                title,
                synopsis,
                releaseDate,
                imageUrl,
                director,
                genre,
                cast,
                url: movieUrl,
                movieId,
                scrapedAt: new Date()
              });
            }
          } catch (error) {
            console.error('Erreur lors du parsing d\'un film:', error);
          }
        });
        
        return moviesData;
      });
      
      console.log(`✅ ${movies.length} films trouvés pour cette semaine`);
      allMovies.push(...movies);
      
      // Pause entre les requêtes pour éviter d'être bloqué
      await page.waitForTimeout(1000 + Math.random() * 2000);
      
    } catch (error) {
      console.error(`❌ Erreur lors du scraping de ${url}:`, error.message);
      continue;
    }
  }
  
  await browser.close();
  
  console.log(`🎯 Total: ${allMovies.length} films récupérés`);
  
  // Sauvegarder en base de données
  if (allMovies.length > 0) {
    await saveToDatabase(allMovies);
  }
  
  return allMovies;
}

// Fonction pour sauvegarder en base de données
async function saveToDatabase(movies) {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log("📦 Connexion à MongoDB établie");
    
    const database = client.db("scrapper");
    const collection = database.collection("allocine_movies");
    
    // Nettoyer la collection existante
    await collection.deleteMany({});
    console.log("🧹 Collection nettoyée");
    
    // Insérer les nouveaux films
    const result = await collection.insertMany(movies);
    console.log(`✅ ${result.insertedCount} films sauvegardés en base`);
    
    // Statistiques sur les images
    const moviesWithImages = movies.filter(m => m.imageUrl && !m.imageUrl.startsWith('data:image'));
    const moviesWithoutImages = movies.filter(m => !m.imageUrl || m.imageUrl.startsWith('data:image'));
    
    console.log(`📊 Statistiques images:`);
    console.log(`  - Films avec images: ${moviesWithImages.length}`);
    console.log(`  - Films sans images: ${moviesWithoutImages.length}`);
    
    if (moviesWithoutImages.length > 0) {
      console.log(`⚠️ Films sans images:`, moviesWithoutImages.slice(0, 5).map(m => m.title));
    }
    
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Fonction principale
async function main() {
  try {
    await scrapeAllocineWithImages();
    console.log("🎉 Scraping terminé avec succès!");
  } catch (error) {
    console.error("💥 Erreur lors du scraping:", error);
    process.exit(1);
  }
}

// Exécuter si le script est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}