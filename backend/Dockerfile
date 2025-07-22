# Dockerfile (production)
FROM ruby:3.1.4

# Installer les dépendances système
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /rails

# Copier Gemfile et Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Installer les gems (sans dev/test pour optimiser)
RUN bundle config --global frozen 1
RUN bundle install --without development test

# Copier le code source
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Migration et démarrage pour la production
# CMD ["sh", "-c", "bundle exec rails db:migrate && bundle exec rails server -b 0.0.0.0 -p $PORT"]
# Test de connexion avant la migration
CMD ["sh", "-c", "nc -zv 3.75.158.163 6543 && bundle exec rails db:migrate && bundle exec rails server -b 0.0.0.0 -p $PORT"]