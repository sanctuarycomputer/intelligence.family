import time

class Timer:
  def __init__(self):
    self.timings = { 'Total': { 'start': time.time() } }
    self.current_step = None

  def __enter__(self):
    return self

  def __exit__(self, exc_type, exc_value, traceback):
    # End any current step
    if self.current_step:
      self.step_end(self.current_step)

    # Calculate total duration
    self.timings['Total']['end'] = time.time()
    self.timings['Total']['duration'] = self.timings['Total']['end'] - self.timings['Total']['start']

    # Print timing summary
    print("\n" + "="*50)
    print("TIMING SUMMARY")
    print("="*50)
    for message, timing in self.timings.items():
      if 'duration' in timing:
        duration = timing['duration']
        total = self.timings['Total']['duration']
        percentage = (duration / total * 100) if total > 0 else 0
        print(f"{message:25s}: {duration:6.2f}s ({percentage:5.1f}%)")
    print("="*50)

  def step_begin(self, message):
    print(f"🕒 {message}...")
    if self.current_step:
      self.step_end(self.current_step)
    self.current_step = message
    # Initialize the timing entry if it doesn't exist
    if self.current_step not in self.timings:
      self.timings[self.current_step] = {}
    self.timings[self.current_step]['start'] = time.time()

  def step_end(self, message):
    self.timings[self.current_step]['end'] = time.time()
    self.timings[self.current_step]['duration'] = self.timings[self.current_step]['end'] - self.timings[self.current_step]['start']