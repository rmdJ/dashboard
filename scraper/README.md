# 🎬 Scraper Allociné

Service de scraping automatique pour récupérer les prochaines sorties cinéma depuis Allociné et les sauvegarder en base MongoDB.

## 🚀 Fonctionnalités

- **Scraping intelligent** : Parcourt les pages d'agenda d'Allociné sur 12 semaines
- **Extraction complète** : Récupère titre, affiche, date de sortie, genre, réalisateur, acteurs, synopsis
- **Navigation automatique** : Utilise la pagination d'Allociné pour naviguer entre les semaines
- **Sauvegarde MongoDB** : Stockage avec dédoublonnage par URL
- **Planification automatique** : Exécution quotidienne via cron
- **Logs détaillés** : Suivi complet avec fichiers de logs
- **Gestion d'erreurs** : Robuste face aux changements de structure HTML

## 📁 Structure du projet

```
scraper/
├── src/
│   ├── scrapers/
│   │   └── allocineScraper.js     # Scraper principal
│   ├── database/
│   │   └── mongodb.js             # Gestion MongoDB
│   ├── schedulers/
│   │   └── cronScheduler.js       # Planification cron
│   └── utils/
│       ├── logger.js              # Système de logs
│       └── helpers.js             # Utilitaires
├── test/
│   └── testScraper.js             # Tests
├── logs/                          # Fichiers de logs
├── .env                           # Configuration
├── package.json
├── index.js                       # Point d'entrée
└── README.md
```

## ⚙️ Installation

1. **Installation des dépendances**
```bash
cd scraper
npm install
```

2. **Configuration**
Copiez `.env.example` vers `.env` et ajustez les paramètres :
```bash
cp .env.example .env
```

Variables importantes :
- `MONGODB_URI` : URI de connexion MongoDB
- `SCRAPE_CRON_SCHEDULE` : Planning cron (défaut: 2h du matin)
- `MAX_WEEKS` : Nombre de semaines à scraper (défaut: 12)
- `HEADLESS_MODE` : Mode headless du navigateur (défaut: true)

## 🎮 Usage

### Commandes disponibles

```bash
# Scraping manuel immédiat
node index.js run

# Démarrage du scheduler (mode daemon)
node index.js schedule

# Test rapide (1 semaine seulement)
node index.js test

# Affichage de l'aide
node index.js help
```

### Test du scraper

Pour tester avant la mise en production :
```bash
npm run test
# ou
node test/testScraper.js
```

## 🗄️ Structure des données

Chaque film est sauvegardé avec la structure suivante :

```javascript
{
  title: "Titre du film",
  url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=123456.html",
  imageUrl: "https://fr.web.img2.acsta.net/.../poster.jpg",
  releaseDate: Date("2025-09-03"),
  genre: "Comédie",
  director: "Réalisateur",
  cast: "Acteur 1, Acteur 2, Acteur 3",
  synopsis: "Synopsis du film...",
  movieId: "123456",
  scrapedAt: Date("2025-01-15T10:30:00Z"),
  lastUpdated: Date("2025-01-15T10:30:00Z"),
  source: "allocine"
}
```

## 📊 Collections MongoDB

### `allocine_movies`
Stockage des films avec dédoublonnage par URL.

### `scraping_logs`
Logs des opérations de scraping pour monitoring.

## 🔧 Configuration avancée

### Planning cron
Le format cron par défaut `0 2 * * *` lance le scraper à 2h du matin chaque jour.

Exemples de configurations :
- `0 2 * * *` : Quotidien à 2h
- `0 2 * * 1` : Chaque lundi à 2h
- `0 */6 * * *` : Toutes les 6h

### Mode debug
Pour débugger le scraper, modifiez `.env` :
```env
HEADLESS_MODE=false
NODE_ENV=development
```

## 📝 Logs

Les logs sont sauvegardés dans le dossier `logs/` :
- `scraper.log` : Log général
- `error.log` : Erreurs uniquement
- `warn.log` : Avertissements

Format JSON pour faciliter l'analyse :
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Scraping terminé",
  "data": { "totalMovies": 150 }
}
```

## 🚨 Gestion d'erreurs

Le scraper est conçu pour être robuste :
- **Retry automatique** sur les erreurs réseau
- **Skip des films invalides** sans arrêter le processus
- **Navigation de fallback** si les boutons ne répondent pas
- **Timeout configurable** pour éviter les blocages
- **User-Agent rotation** pour éviter la détection

## 🔒 Bonnes pratiques

1. **Respect des serveurs** : Délais entre les requêtes
2. **User-Agent réaliste** : Simulation d'un navigateur normal
3. **Gestion des cookies** : Maintien de session
4. **Monitoring** : Surveillance des logs d'erreur

## 🐳 Déploiement

### Docker (optionnel)
```dockerfile
FROM node:18-slim
RUN apt-get update && apt-get install -y chromium
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js", "schedule"]
```

### Service systemd
```ini
[Unit]
Description=Allocine Scraper
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/path/to/scraper
ExecStart=/usr/bin/node index.js schedule
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📈 Monitoring

Pour surveiller le scraper en production :

1. **Logs d'erreur** : `tail -f logs/error.log`
2. **Status MongoDB** : Vérifier les collections
3. **Métriques** : Nombre de films par scraping
4. **Alertes** : Notification si 0 film scrapé

## 🤝 Contribution

Le code est structuré pour faciliter les modifications :
- Sélecteurs HTML centralisés dans le scraper
- Configuration externalisée dans `.env`
- Logs détaillés pour debug
- Architecture modulaire

## 📄 Licence

Usage personnel - Respecter les conditions d'utilisation d'Allociné.