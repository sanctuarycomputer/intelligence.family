import os
import torch
from pyannote.audio import Pipeline
from benchmark.utils import Timer
import onnxruntime as ort
import soundfile as sf
import numpy as np

class Runner:
  @staticmethod
  def run():
    os.environ["HF_HUB_OFFLINE"] = "1"

    print("Detecting GPU acceleration...")

    if 'CUDAExecutionProvider' in ort.get_all_providers():
      print("🚀 ONNX Runtime: GPU Acceleration is active!")
    else:
      print("🐢 ONNX Runtime: GPU not found. Using CPU.")

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

    with Timer() as timer:
      timer.step_begin("Speaker Diarization")
      audio, sr = sf.read("./parents_meetcute.wav", dtype="float32")
      if audio.ndim == 1:
        audio = audio[None, :]
      else:
        audio = audio.T
      waveform = torch.from_numpy(audio)
      diarization_pipeline = Pipeline.from_pretrained(
        "pyannote/speaker-diarization-3.1",
        cache_dir=os.getenv("HF_HOME", "./models/huggingface")
      ).to(torch.device(pyannote_device))
      diarization = diarization_pipeline({"waveform": waveform, "sample_rate": sr})

      timer.step_end("Speaker Diarization")