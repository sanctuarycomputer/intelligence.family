#!/usr/bin/env python3
"""
Download all models required for offline operation.
This script should be run during Docker build.
"""
import os
import sys
from benchmark.runner import Runner

if __name__ == "__main__":
  print("=" * 60)
  print("Running benchmarks...")
  print("=" * 60)

  # Check for HF_TOKEN (required for Pyannote models)
  if not os.getenv("HF_TOKEN"):
    print("WARNING: HF_TOKEN not set. Pyannote models may fail to download.")
    print("Set HF_TOKEN as build arg if needed: --build-arg HF_TOKEN=your_token")

  try:
    Runner.run()
    print("=" * 60)
    print("✅ All benchmarks run successfully!")
    print("=" * 60)
    sys.exit(0)
  except Exception as e:
    print(f"❌ Error running benchmarks: {e}")
    sys.exit(1)

