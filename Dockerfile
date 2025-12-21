ARG JETSON_BASE=nvcr.io/nvidia/l4t-jetpack:r36.4.0
ARG PI_BASE=ubuntu:22.04

# 1. Select the base image
ARG BASE_IMAGE=${PI_BASE}
FROM ${BASE_IMAGE}

# Re-declare ARGs for use inside this stage
ARG USE_CUDA=false
ENV DEBIAN_FRONTEND=noninteractive

# 2. System Basics
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-dev \
    curl \
    # The "Must-Haves" for Jetson PyTorch
    libopenblas-dev \
    libopenmpi-dev \
    libomp-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Handle Python Dependencies
# We use the Jetson AI Lab for Jetson to get optimized wheels.
# On the Pi, we use standard wheels.
RUN if [ "$USE_CUDA" = "true" ]; then \
    pip3 install --no-cache-dir torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://pypi.jetson-ai-lab.io/jp6/cu126; \
    else \
    pip3 install --no-cache-dir torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0; \
    fi

# Install Ollama
#  RUN curl -fsSL https://ollama.com/install.sh | sh

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

# Tells PyTorch 2.6+ to allow loading "untrusted" globals (required for pyannote)
ENV TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=true

# Download Python models (Whisper, Pyannote, SentenceTransformers)
# This will download to ./models/whisper and ~/.cache/huggingface
RUN python3 download_models.py

# Set HuggingFace to offline mode after downloads
ENV HF_HUB_OFFLINE=1

# Default command to run the benchmark
# Note: If using MemoryMachine (which uses Ollama), start Ollama service first:
# docker run ... sh -c "ollama serve & python -m benchmark"
# Or use a docker-compose.yml with Ollama as a separate service
CMD ["python3", "run_benchmarks.py"]

