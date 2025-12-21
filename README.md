# Family Intelligence Benchmarks

This is a repo for benchmarking some local LLM calls around
voice fingerprinting, transcription, & text generation.

This container is designed to run on a small chipset, like a
Raspberry Pi 5, NVIDIA Jetson Orin Nano, or NVIDIA Jetson Thor.

## Download Repo

NVIDIA's Jetson OS ships with git and Docker, so on those chips,
you just need to run

```
git clone
```

## Install models



```
docker build --build-arg HF_TOKEN=your_token_here -t intelfam .


docker build \
  --build-arg HF_TOKEN=your_token_here \
  --build-arg BASE_IMAGE=nvcr.io/nvidia/l4t-jetpack:r36.4.0 \
  --build-arg USE_CUDA=true \
  -t intelfam:jetson .

```

## Run benchmarks

**First,** disconnect your device from WiFi. The benchmark script
is runs entirely offline, so this should give you confidence no
cloud calls are being made.


```
docker run --rm intelfam:pi

docker run --rm \
  --gpus all \
  -e NVIDIA_DRIVER_CAPABILITIES=all \
  intelfam:jetson
```

## Results

### Raspberry Pi 5

**Base OS:**

### NVIDIA Jetson Orin Nano

**Base OS:**