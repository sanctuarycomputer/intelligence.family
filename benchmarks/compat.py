import torchaudio

# Monkey-patch: torchaudio 2.9.0 removed AudioMetaData, which pyannote 3.1 requires.
if not hasattr(torchaudio, 'AudioMetaData'):
  class FakeAudioMetaData:
    def __init__(self, sample_rate=0, num_frames=0, num_channels=0, bits_per_sample=0, encoding=""):
      self.sample_rate = sample_rate
      self.num_frames = num_frames
      self.num_channels = num_channels
      self.bits_per_sample = bits_per_sample
      self.encoding = encoding
  torchaudio.AudioMetaData = FakeAudioMetaData

# Also patch list_audio_backends which was removed in 2.9.0
if not hasattr(torchaudio, 'list_audio_backends'):
  torchaudio.list_audio_backends = lambda: ['ffmpeg']