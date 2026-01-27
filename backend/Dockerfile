# Dockerfile Backend FastAPI
FROM python:3.11-slim

WORKDIR /app

# Installation des dependances systeme
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copie des dependances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code
COPY app/ ./app/
COPY train_model.py .
COPY start.sh .
RUN chmod +x start.sh

# Creer le dossier pour les modeles ML
RUN mkdir -p /app/models

# Variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV MODELS_DIR=/app/models

# Exposer le port
EXPOSE 8000

# Commande de demarrage avec entrainement ML
CMD ["./start.sh"]
