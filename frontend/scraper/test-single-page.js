import puppeteer from "puppeteer";

// Test sur une seule page pour vérifier l'extraction des images
async function testSinglePage() {
  console.log("🧪 Test d'extraction d'images sur une seule page");
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Configuration de la page
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log("🔍 Chargement de la page...");
    await page.goto("https://www.allocine.fr/film/agenda/sem-0/", { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    console.log("⏳ Attente du chargement des images...");
    await page.waitForTimeout(3000);
    
    // Extraire les données des films avec focus sur les images
    const movies = await page.evaluate(() => {
      const movieElements = document.querySelectorAll('.card.entity-card.entity-card-list.cf');
      const moviesData = [];
      
      movieElements.forEach((element, index) => {
        try {
          // Titre
          const titleElement = element.querySelector('.meta-title a');
          const title = titleElement ? titleElement.textContent.trim() : `Film ${index}`;
          
          // Image - Essayer plusieurs méthodes d'extraction
          let imageUrl = null;
          let imageDebugInfo = {};
          
          const imgElement = element.querySelector('.thumbnail-container img.thumbnail-img');
          if (imgElement) {
            // Récupérer tous les attributs d'image possibles
            const src = imgElement.getAttribute('src');
            const dataSrc = imgElement.getAttribute('data-src');
            const dataLazySrc = imgElement.getAttribute('data-lazy-src');
            const dataOriginal = imgElement.getAttribute('data-original');
            
            imageDebugInfo = { src, dataSrc, dataLazySrc, dataOriginal };
            
            // Choisir la meilleure URL d'image
            if (src && !src.startsWith('data:image')) {
              imageUrl = src;
            } else if (dataSrc && !dataSrc.startsWith('data:image')) {
              imageUrl = dataSrc;
            } else if (dataLazySrc && !dataLazySrc.startsWith('data:image')) {
              imageUrl = dataLazySrc;
            } else if (dataOriginal && !dataOriginal.startsWith('data:image')) {
              imageUrl = dataOriginal;
            }
          }
          
          if (title && index < 10) { // Limiter à 10 films pour le test
            moviesData.push({
              title,
              imageUrl,
              imageDebugInfo,
              hasImage: !!imageUrl && !imageUrl.startsWith('data:image')
            });
          }
        } catch (error) {
          console.error('Erreur parsing film:', error);
        }
      });
      
      return moviesData;
    });
    
    console.log(`✅ ${movies.length} films extraits`);
    
    // Analyser les résultats
    const withImages = movies.filter(m => m.hasImage);
    const withoutImages = movies.filter(m => !m.hasImage);
    
    console.log(`\n📊 Résultats:`);
    console.log(`  - Films avec images: ${withImages.length}`);
    console.log(`  - Films sans images: ${withoutImages.length}`);
    
    if (withImages.length > 0) {
      console.log(`\n✅ Exemples d'images trouvées:`);
      withImages.slice(0, 3).forEach(movie => {
        console.log(`  - ${movie.title}: ${movie.imageUrl}`);
      });
    }
    
    if (withoutImages.length > 0) {
      console.log(`\n❌ Films sans images (debug info):`);
      withoutImages.slice(0, 3).forEach(movie => {
        console.log(`  - ${movie.title}:`);
        console.log(`    src: ${movie.imageDebugInfo.src}`);
        console.log(`    data-src: ${movie.imageDebugInfo.dataSrc}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await browser.close();
  }
}

testSinglePage().catch(console.error);