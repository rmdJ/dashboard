# Dockerfile pour le frontend React/Vite
FROM node:20.19.0-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package.json package-lock.json* yarn.lock* ./

# Installer les dépendances
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copier le code source
COPY . .

# Exposer le port 5173 (port par défaut de Vite)
EXPOSE 5174

# Commande de démarrage pour le mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]