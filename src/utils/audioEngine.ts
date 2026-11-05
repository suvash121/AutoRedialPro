// Web Audio API engine for simulated telecom tones and real mic VAD

export type AudioScenario = 'IVR_VOICE' | 'RINGBACK_TONE' | 'BUSY_TONE' | 'HUMAN_PICKUP' | 'LIVE_MIC' | 'SILENCE';

export interface AudioDspMetrics {
  rmsEnergy: number; // 0.0 to 1.0
  dbValue: number;   // e.g. -60dB to 0dB
  detectedType: 'SILENCE' | 'RINGBACK' | 'VOICE_IVR' | 'BUSY';
  frequencyData: Uint8Array;
  timeData: Uint8Array;
}

class TelecomAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: AudioNode | null = null;
  private micStream: MediaStream | null = null;
  private activeScenario: AudioScenario = 'SILENCE';
  private ringCadenceTimer: number | null = null;
  private isOscillatorPlaying = false;
  private activeOscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.2;
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public stopAllAudio() {
    if (this.ringCadenceTimer) {
      window.clearInterval(this.ringCadenceTimer);
      this.ringCadenceTimer = null;
    }

    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignored
      }
    });
    this.activeOscillators = [];
    this.isOscillatorPlaying = false;

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Ignored
      }
      this.sourceNode = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.activeScenario = 'SILENCE';
  }

  /**
   * Scenario: Normal Ringback Tone (US Telecom 440Hz + 480Hz dual tone cadence: 2s ON, 4s OFF)
   */
  public playRingbackTone(onCadenceChange?: (isBeeping: boolean) => void) {
    this.stopAllAudio();
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    this.activeScenario = 'RINGBACK_TONE';

    const triggerBurst = () => {
      if (this.activeScenario !== 'RINGBACK_TONE' || !this.ctx || !this.analyser) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, this.ctx.currentTime); // 440 Hz
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, this.ctx.currentTime); // 480 Hz

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      this.activeOscillators = [osc1, osc2];

      onCadenceChange?.(true);

      window.setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch {
          // Ignored
        }
        onCadenceChange?.(false);
      }, 2000);
    };

    triggerBurst();
    this.ringCadenceTimer = window.setInterval(triggerBurst, 6000);
  }

  /**
   * Scenario: Operator Busy / Reorder Tone (480Hz + 620Hz, 0.5s ON / 0.5s OFF)
   */
  public playBusyTone() {
    this.stopAllAudio();
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    this.activeScenario = 'BUSY_TONE';

    const triggerBusyPulse = () => {
      if (this.activeScenario !== 'BUSY_TONE' || !this.ctx || !this.analyser) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(620, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.22, this.ctx.currentTime + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      this.activeOscillators = [osc1, osc2];

      window.setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
        } catch {
          // Ignored
        }
      }, 500);
    };

    triggerBusyPulse();
    this.ringCadenceTimer = window.setInterval(triggerBusyPulse, 1000);
  }

  /**
   * Scenario: IVR Robot Voice Prompt (Broadband voice audio spike)
   * Generates vocal formant synthesis + Web Speech synthesis
   */
  public playIvrVoice(phrase: string = "The number you have called is currently busy, please hold on or try again...") {
    this.stopAllAudio();
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    this.activeScenario = 'IVR_VOICE';

    // Create an audio oscillator modulated by pink noise to generate instant broadband voice energy
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 3, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < noiseBuffer.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.25;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Vocal tract formant bandpass filter (centered around human speech formants 800Hz - 2200Hz)
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1100, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    noiseSource.start();
    this.sourceNode = noiseSource;

    // Also trigger Web Speech API voice if available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.pitch = 0.95;
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Scenario: Real Live Microphone Input
   */
  public async startLiveMicrophone(): Promise<boolean> {
    this.stopAllAudio();
    this.initContext();
    if (!this.ctx || !this.analyser) return false;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      const micSource = this.ctx.createMediaStreamSource(this.micStream);
      micSource.connect(this.analyser);
      // NOTE: Do NOT connect mic directly to destination to prevent audio feedback screeching!
      this.sourceNode = micSource;
      this.activeScenario = 'LIVE_MIC';
      return true;
    } catch (err) {
      console.warn("Microphone access denied or unavailable", err);
      return false;
    }
  }

  /**
   * Plays a standard DTMF dual-frequency telephone key tone (e.g. key 1 = 697Hz + 1209Hz)
   */
  public playDtmfTone(digit: string) {
    this.initContext();
    if (!this.ctx) return;

    const dtmfMap: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477],
      '+': [941, 1336],
    };

    const freqs = dtmfMap[digit];
    if (!freqs) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.setValueAtTime(freqs[0], this.ctx.currentTime);
    osc2.frequency.setValueAtTime(freqs[1], this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();

    window.setTimeout(() => {
      try {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      } catch {
        // Ignored
      }
    }, 130);
  }

  public getMetrics(): AudioDspMetrics {
    if (!this.analyser) {
      return {
        rmsEnergy: 0,
        dbValue: -90,
        detectedType: 'SILENCE',
        frequencyData: new Uint8Array(0),
        timeData: new Uint8Array(0),
      };
    }

    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeData = new Uint8Array(this.analyser.fftSize);

    this.analyser.getByteFrequencyData(freqData);
    this.analyser.getByteTimeDomainData(timeData);

    // Calculate RMS from timeData
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / timeData.length);
    const db = rms > 0.0001 ? 20 * Math.log10(rms) : -90;

    // Detect tone characteristics from frequency bins
    // Sample rate typically 48000, bin width = 48000 / 512 ~ 93.75 Hz
    const binSize = (this.ctx?.sampleRate || 48000) / (this.analyser.fftSize);
    const bin440 = Math.round(440 / binSize);
    const bin480 = Math.round(480 / binSize);
    const bin620 = Math.round(620 / binSize);

    const ringEnergy = (freqData[bin440] || 0) + (freqData[bin480] || 0);
    const busyEnergy = (freqData[bin480] || 0) + (freqData[bin620] || 0);

    let highMidEnergy = 0;
    for (let b = 15; b < 40; b++) {
      highMidEnergy += freqData[b] || 0;
    }

    let detected: 'SILENCE' | 'RINGBACK' | 'VOICE_IVR' | 'BUSY' = 'SILENCE';

    if (rms > 0.06) {
      if (this.activeScenario === 'RINGBACK_TONE' || (ringEnergy > 240 && highMidEnergy < 350)) {
        detected = 'RINGBACK';
      } else if (this.activeScenario === 'BUSY_TONE' || busyEnergy > 260) {
        detected = 'BUSY';
      } else {
        detected = 'VOICE_IVR';
      }
    }

    return {
      rmsEnergy: Math.min(rms * 2.5, 1.0),
      dbValue: Math.round(db),
      detectedType: detected,
      frequencyData: freqData,
      timeData: timeData,
    };
  }
}

export const telecomAudioEngine = new TelecomAudioEngine();
