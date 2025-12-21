# Family Intelligence Benchmarks

This is a repo for benchmarking some local LLM calls around
voice fingerprinting, transcription, & text generation.

This container is designed to run on a small chipset, like a
Raspberry Pi 5, NVIDIA Jetson Orin Nano, or NVIDIA Jetson Thor.

## Install models

```
docker build --build-arg HF_TOKEN=your_token_here -t intelfam .
```

## Run benchmarks

**First,** disconnect your device from WiFi. The benchmark script
is runs entirely offline, so this should give you confidence no
cloud calls are being made.


```
docker run --rm intelfam
```

## Results

### Raspberry Pi 5

**Base OS:**

### NVIDIA Jetson Orin Nano

**Base OS:**