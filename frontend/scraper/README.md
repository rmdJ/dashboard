# Scraper Allociné Corrigé - Images Fixes

Ce scraper corrige le problème d'extraction des images qui récupérait des placeholders `data:image` au lieu des vraies URLs d'images.

## 🔧 Corrections apportées

- **Extraction des vraies URLs d'images** : Le scraper vérifie maintenant plusieurs attributs (`src`, `data-src`, `data-lazy-src`) et évite les placeholders
- **Attente du chargement des images** : Fonction `waitForImages()` pour s'assurer que les images sont chargées avant l'extraction
- **Gestion des erreurs améliorée** : Meilleure gestion des timeouts et des erreurs de connexion
- **Configuration Puppeteer optimisée** : Utilise `headless: "new"` et des options pour éviter les blocages

## 📦 Installation

```bash
cd scraper
npm install
```

## 🚀 Utilisation

### Test avec films d'exemple (recommandé)
```bash
# Insérer des films de test avec vraies images
node test-insert-sample-movies.js
```

### Scraper complet (attention aux limitations d'Allociné)
```bash
# Lancer le scraper une seule fois
node src/scrapers/allocineImageFixedScraper.js

# Ou lancer le service avec scheduling
node index.js
```

### Test sur une seule page
```bash
# Pour déboguer l'extraction d'images
node test-single-page.js
```

## 🎯 Films de test insérés

Le script `test-insert-sample-movies.js` insère 3 films :

1. **Test Film avec Image** - avec une vraie URL d'image Allociné
2. **Adieu Jean-Pat** - avec l'image de l'exemple fourni (`4f997c99f0e279958d2cd09dcbebd58c.jpg`)
3. **Film Sans Image** - sans image pour comparaison

## 🔍 Vérification

Après avoir inséré les films de test, vérifiez sur votre frontend `/cinema/agenda` que :
- Les films avec images affichent les posters correctement
- Les films sans image affichent un placeholder par défaut
- Pas de `data:image/gif` dans les URLs d'images

## 📊 Structure des données

Chaque film extrait contient :
```javascript
{
  title: "Titre du film",
  synopsis: "Synopsis...",
  releaseDate: Date,
  imageUrl: "https://fr.web.img2.acsta.net/c_310_420/...", // Vraie URL ou null
  director: "Réalisateur",
  genre: "Genre",
  cast: "Acteurs",
  url: "https://www.allocine.fr/film/...",
  movieId: "123456",
  scrapedAt: Date
}
```

## ⚠️ Notes importantes

- **Limitations d'Allociné** : Le site peut bloquer le scraping massif
- **Test recommandé** : Commencez par les films de test avant le scraper complet
- **Images** : Certaines images peuvent encore être des placeholders selon la politique de lazy loading d'Allociné