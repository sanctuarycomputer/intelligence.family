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

# Run this on the Orin or Thor host OS (not inside Docker)
sudo nvpmodel -m 0  # Sets to max power mode
sudo jetson_clocks  # Locks clocks to maximum frequency

```
docker build \
  --build-arg BASE_IMAGE=ubuntu:22.04 \
  --build-arg DEVICE_TYPE=pi \
  -t intelfam:pi .

docker build \
  --build-arg BASE_IMAGE=nvcr.io/nvidia/l4t-jetpack:r36.4.0 \
  --build-arg DEVICE_TYPE=orin \
  -t intelfam:orin .

docker build \
  --build-arg BASE_IMAGE=nvcr.io/nvidia/pytorch:25.08-py3 \
  --build-arg DEVICE_TYPE=thor \
  -t intelfam:thor .

```

## Download Models

```
docker run --rm -it \
  -e HF_TOKEN=your_token_here \
  -v ./models:/app/models \
  intelfam:thor python3 download_models.py
```

## Run benchmarks

**First,** disconnect your device from WiFi. The benchmark script
is runs entirely offline, so this should give you confidence no
cloud calls are being made.


```
docker run --rm --network none intelfam:pi

docker run --rm \
  --runtime=nvidia \
  --network=none \
  --cpuset-cpus="1-5" \
  --shm-size=2g \
  -e NVIDIA_DRIVER_CAPABILITIES=all \
  intelfam:jetson
```

## Results

### Raspberry Pi 5

**Base OS:**

### NVIDIA Jetson Orin Nano

**Base OS:**

### NVIDIA Jetson AGX Thor

**Base OS: **