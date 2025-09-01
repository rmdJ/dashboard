import puppeteer from 'puppeteer';

async function debugPageStructure() {
  console.log('🔍 Débogage de la structure de page Allociné');
  
  const browser = await puppeteer.launch({ 
    headless: false,  // Mode visible pour déboguer
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  try {
    console.log('🌐 Chargement de la page sem-0');
    await page.goto('https://www.allocine.fr/film/agenda/sem-0/', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Analyser la structure de la page
    const pageInfo = await page.evaluate(() => {
      const title = document.title;
      const url = window.location.href;
      
      // Chercher différents sélecteurs possibles
      const selectors = [
        '.card.entity-card.entity-card-list',
        '.card.entity-card',
        '.entity-card-list',
        '.card',
        '.movie-card',
        '.film-card',
        '.agenda-card',
        '[data-movie]',
        '.thumbnail-container'
      ];
      
      const results = {};
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        results[selector] = elements.length;
      });
      
      // Chercher les éléments d'image
      const images = document.querySelectorAll('img');
      const imageInfo = {
        total: images.length,
        withSrc: Array.from(images).filter(img => img.src && !img.src.startsWith('data:')).length,
        withDataSrc: Array.from(images).filter(img => img.getAttribute('data-src')).length,
        placeholders: Array.from(images).filter(img => img.src && img.src.startsWith('data:')).length
      };
      
      // Échantillon de HTML de la page
      const sampleHTML = document.body.innerHTML.substring(0, 2000);
      
      return {
        title,
        url,
        selectors: results,
        imageInfo,
        sampleHTML
      };
    });
    
    console.log('📄 Titre de la page:', pageInfo.title);
    console.log('🔗 URL:', pageInfo.url);
    console.log('\n🎯 Résultats des sélecteurs:');
    
    Object.entries(pageInfo.selectors).forEach(([selector, count]) => {
      console.log(`  ${selector}: ${count} éléments`);
    });
    
    console.log('\n🖼️ Informations sur les images:');
    console.log(`  Total d'images: ${pageInfo.imageInfo.total}`);
    console.log(`  Images avec src valide: ${pageInfo.imageInfo.withSrc}`);
    console.log(`  Images avec data-src: ${pageInfo.imageInfo.withDataSrc}`);
    console.log(`  Placeholders: ${pageInfo.imageInfo.placeholders}`);
    
    console.log('\n📝 Échantillon HTML:', pageInfo.sampleHTML.substring(0, 500) + '...');
    
    // Attendre 10 secondes pour permettre l'inspection manuelle
    console.log('\n⏳ Attente de 10 secondes pour inspection manuelle...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await browser.close();
  }
}

debugPageStructure().catch(console.error);