import os
from faster_whisper import download_model
from pyannote.audio import Pipeline, Model

WHISPER_SIZE = "medium"  # or "large-v3" for best quality

class System:
  @staticmethod
  def prepare():
    HF_TOKEN = os.getenv("HF_TOKEN") # Required for Pyannote

    # 1. Download Whisper (Speech-to-Text)
    print(f"Downloading Whisper '{WHISPER_SIZE}' to ./models/whisper...")
    model_path = download_model(WHISPER_SIZE, output_dir="./models/whisper")
    print(f"Whisper downloaded to: {model_path}")

    # 2. Download Pyannote (Speaker Identification)
    print("Triggering Pyannote download to default cache...")
    # Pyannote is complex; it downloads multiple models (segmentation, embeddings)
    # to your system's HuggingFace cache (~/.cache/huggingface).
    # By running this once, we ensure the files exist on disk.
    pipeline = Pipeline.from_pretrained(
      "pyannote/speaker-diarization-3.1",
      use_auth_token=HF_TOKEN,
      cache_dir=os.getenv("HF_HOME", "./models/huggingface")
    )
    print("Pyannote diarization pipeline downloaded")

    print("--- Downloading Segmentation Model (Specific) ---")

    # Manually triggering this ensures it bypasses the silent failure
    print("Downloading Segmentation Model (Specific)...")
    seg_model = Model.from_pretrained(
        "pyannote/segmentation-3.0",
        use_auth_token=HF_TOKEN,
        cache_dir=os.getenv("HF_HOME", "./models/huggingface")
    )
    print("Segmentation model downloaded")

    # 3. Download Pyannote embedding model (for voice fingerprinting)
    print("Downloading Pyannote embedding model for voice fingerprinting...")
    embedding_model = Model.from_pretrained(
      "pyannote/embedding",
      use_auth_token=HF_TOKEN,
      cache_dir=os.getenv("HF_HOME", "./models/huggingface")
    )
    print("Pyannote embedding model downloaded")

    print("--- DOWNLOAD COMPLETE ---")
    print("You can now disconnect the internet.")
    os.environ["HF_HUB_OFFLINE"] = "1"