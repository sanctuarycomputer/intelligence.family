ARG THOR_BASE=nvcr.io/nvidia/pytorch:25.08-py3
ARG ORIN_BASE=nvcr.io/nvidia/l4t-jetpack:r36.4.0
ARG PI_BASE=ubuntu:22.04

# 1. Select the base image
ARG BASE_IMAGE=${PI_BASE}
FROM ${BASE_IMAGE}

# Re-declare ARGs for use inside this stage
ARG DEVICE_TYPE=pi
ENV DEBIAN_FRONTEND=noninteractive

# 2. System Basics + FFmpeg Dev Headers for TorchCodec compilation
RUN apt-get update && apt-get install -y \
    python3-pip python3-dev ffmpeg curl \
    libsndfile1 \
    libopenblas-dev libopenmpi-dev libomp-dev \
    libavformat-dev libavcodec-dev libavdevice-dev \
    libavutil-dev libavfilter-dev libswscale-dev libswresample-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Handle Python Dependencies
RUN if [ "$DEVICE_TYPE" = "thor" ]; then \
    # AGX Thor: Install core stack from cu130 index
    pip3 install --no-cache-dir \
    torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/cu130; \
    elif [ "$DEVICE_TYPE" = "orin" ]; then \
    pip3 install --no-cache-dir \
    torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 \
    --index-url https://pypi.jetson-ai-lab.io/jp6/cu126; \
    else \
    pip3 install --no-cache-dir \
    torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0; \
    fi

# On Thor, we need to manually compile torchcodec from source
RUN if [ "$DEVICE_TYPE" = "thor" ]; then \
    apt-get update && apt-get install -y \
    build-essential cmake ninja-build git pkg-config \
    && rm -rf /var/lib/apt/lists/* && \
    pip uninstall -y torchcodec || true && \
    I_CONFIRM_THIS_IS_NOT_A_LICENSE_VIOLATION=1 \
    pip install -v --no-cache-dir --no-build-isolation \
    git+https://github.com/pytorch/torchcodec.git; \
    fi

# RUN curl -fsSL https://ollama.com/install.sh | sh
# RUN (ollama serve &) && sleep 5 && ollama pull qwen2.5 && pkill -f ollama

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt || true
COPY . .

ENV PYTHONPATH=/app
ENV PYTHONWARNINGS="ignore"

# Set HuggingFace cache directory so we can use Docker volumes
ENV HF_HOME=/app/models/huggingface
ENV HUGGINGFACE_HUB_CACHE=/app/models/huggingface
ENV TRANSFORMERS_CACHE=/app/models/huggingface
ENV PYANNOTE_CACHE=/app/models/huggingface
ENV TORCH_HOME=/app/models/torch_hub
ENV OLLAMA_MODELS=/app/models/ollama

ENV TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=true
ENV LD_LIBRARY_PATH=/opt/hpcx/ucx/lib:/opt/hpcx/ucc/lib:$LD_LIBRARY_PATH
ENV TORCHAUDIO_USE_BACKEND_DISPATCHER=0

# Run the benchmarks
CMD ["python3", "run_benchmarks.py"]

