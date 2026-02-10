// Global Audio Manager - Singleton pattern for persistent audio across pages
// Place this file at: /app/utils/audioManager.ts

class AudioManager {
  private static instance: AudioManager;
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private bufferLength: number = 0;
  private isInitialized = false;
  private isPlaying = false;
  
  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init(audioElementId: string = 'global-background-music'): void {
    if (this.isInitialized) return;

    // Check if audio element already exists
    let audioEl = document.getElementById(audioElementId) as HTMLAudioElement;
    
    if (!audioEl) {
      // Create audio element if it doesn't exist
      audioEl = document.createElement('audio');
      audioEl.id = audioElementId;
      audioEl.preload = 'auto';
      audioEl.loop = true; // Enable looping
      
      const source = document.createElement('source');
      source.src = '/audio/lovemenot.mp3';
      source.type = 'audio/mpeg';
      
      audioEl.appendChild(source);
      document.body.appendChild(audioEl);
    }

    this.audio = audioEl;
    this.isInitialized = true;

    // Restore playback state from sessionStorage
    const wasPlaying = sessionStorage.getItem('audioWasPlaying') === 'true';
    const savedTime = parseFloat(sessionStorage.getItem('audioCurrentTime') || '20');
    
    if (this.audio) {
      this.audio.currentTime = savedTime;
      
      // Only attempt autoplay if was previously playing
      // This will still fail if no user interaction, but won't log errors
      if (wasPlaying) {
        this.play().catch(() => {
          // Silently fail - audio will start on first user interaction
        });
      }
    }

    // Save state before page unload
    window.addEventListener('beforeunload', () => {
      if (this.audio) {
        sessionStorage.setItem('audioWasPlaying', this.isPlaying.toString());
        sessionStorage.setItem('audioCurrentTime', this.audio.currentTime.toString());
      }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.audio && this.isPlaying) {
        // Optionally pause when tab is hidden
        // this.pause();
      } else if (!document.hidden && this.audio) {
        // Resume if was playing
        const wasPlaying = sessionStorage.getItem('audioWasPlaying') === 'true';
        if (wasPlaying && !this.isPlaying) {
          this.play().catch(() => {
            // Silently fail
          });
        }
      }
    });
  }

  public initAudioContext(): void {
    if (this.audioContext || !this.audio) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaElementSource(this.audio);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.75;
      this.analyser.minDecibels = -85;
      this.analyser.maxDecibels = -20;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
    } catch (error) {
      // Silently fail - likely already created from another source
    }
  }

  public getAnalyserData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  public getBufferLength(): number {
    return this.bufferLength;
  }

  public hasAnalyser(): boolean {
    return this.analyser !== null && this.dataArray !== null;
  }

  public async play(): Promise<void> {
    if (!this.audio) return;

    try {
      // Initialize audio context if needed
      if (!this.audioContext) {
        this.initAudioContext();
      }

      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.audio.play();
      this.isPlaying = true;
      sessionStorage.setItem('audioWasPlaying', 'true');
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('audioStateChange', { 
        detail: { isPlaying: true } 
      }));
    } catch (error) {
      // Don't log autoplay errors - they're expected
      if (error instanceof Error && !error.message.includes('user didn\'t interact')) {
        console.error('Audio play failed:', error);
      }
      this.isPlaying = false;
      throw error; // Re-throw so caller can handle
    }
  }

  public pause(): void {
    if (!this.audio) return;

    this.audio.pause();
    this.isPlaying = false;
    sessionStorage.setItem('audioWasPlaying', 'false');
    
    window.dispatchEvent(new CustomEvent('audioStateChange', { 
      detail: { isPlaying: false } 
    }));
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play().catch(() => {
        // Silently handle autoplay restriction
      });
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public setCurrentTime(time: number): void {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audio;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();