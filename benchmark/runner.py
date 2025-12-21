import os
import torch

class Runner:
  @staticmethod
  def run():
    os.environ["HF_HUB_OFFLINE"] = "1"
    print("Foo bar baz...")

    if torch.cuda.is_available():
      pyannote_device = torch.device("cuda")
      print("🚀 Pyannote: Using NVIDIA GPU")
    elif torch.backends.mps.is_available():
      pyannote_device = torch.device("mps")
      print("🚀 Pyannote: Using Apple Silicon GPU (MPS)")
    else:
      pyannote_device = torch.device("cpu")
      print("🐢 Pyannote: Using CPU")

    if torch.cuda.is_available():
      whisper_device = "cuda"
      whisper_compute = "float16"
      print("🚀 Whisper: Using NVIDIA GPU")
    else:
      whisper_device = "cpu"
      whisper_compute = "int8"
      print("🐢 Whisper: Using CPU (MPS not supported by this library yet)")