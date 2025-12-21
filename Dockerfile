FROM python:3.11-slim

# Install system dependencies for audio processing, PostgreSQL, and Ollama
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    postgresql-client \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files (needed for download script)
COPY . .

# Set Python path to include current directory
ENV PYTHONPATH=/app

# Build argument for HuggingFace token (required for Pyannote models)
ARG HF_TOKEN
ENV HF_TOKEN=${HF_TOKEN}

# Download all models during build
# Note: Ollama needs to run as a service to pull models
# We'll start it in the background, pull the model, then stop it
RUN (ollama serve &) && \
    sleep 5 && \
    ollama pull qwen2.5 && \
    pkill -f ollama || true && \
    wait || true

# Download Python models (Whisper, Pyannote, SentenceTransformers)
# This will download to ./models/whisper and ~/.cache/huggingface
RUN python download_models.py

# Set HuggingFace to offline mode after downloads
ENV HF_HUB_OFFLINE=1

# Default command to run the benchmark
# Note: If using MemoryMachine (which uses Ollama), start Ollama service first:
# docker run ... sh -c "ollama serve & python -m benchmark"
# Or use a docker-compose.yml with Ollama as a separate service
CMD ["python", "run_benchmarks.py"]

