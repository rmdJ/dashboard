# backend/Dockerfile
FROM ruby:3.1.4-slim

# Installer les dépendances système (version allégée)
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    postgresql-client \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Définir le répertoire de travail
WORKDIR /rails

# Copier et installer les gems en premier (meilleure mise en cache Docker)
COPY Gemfile Gemfile.lock ./
RUN bundle config --global frozen 1 && \
    bundle install --without development test --jobs 4 --retry 3

# Copier le code source
COPY . .

# Précompiler les assets si tu en as
# RUN bundle exec rails assets:precompile

# Variables d'environnement pour Railway
ENV RAILS_ENV=production
ENV RAILS_SERVE_STATIC_FILES=true
ENV RAILS_LOG_TO_STDOUT=true

# Exposer le port (Railway utilise la variable $PORT)
EXPOSE $PORT

# Script de démarrage optimisé
CMD ["sh", "-c", "bundle exec rails db:migrate 2>/dev/null || true && bundle exec rails server -b 0.0.0.0 -p ${PORT:-3000}"]