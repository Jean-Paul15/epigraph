# Dockerfile pour le generateur de donnees
FROM python:3.11-slim

WORKDIR /app

# Copier les dependances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY generator/ ./generator/
COPY main.py .

# Creer le dossier de sortie
RUN mkdir -p /app/output

# Variables d'environnement
ENV OUTPUT_DIR=/app/output
ENV SEED=42
ENV PYTHONUNBUFFERED=1

# Executer le generateur
CMD ["python", "main.py"]
