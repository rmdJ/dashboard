# Dockerfile pour le frontend React/Vite
FROM node:20.19.3-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package.json package-lock.json* yarn.lock* ./

# Installer les dépendances avec npm ci pour une installation plus fiable
RUN npm ci

# Copier le code source
COPY . .

# Exposer le port 5174
EXPOSE 5174

# Commande de démarrage pour le mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]