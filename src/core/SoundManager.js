import * as THREE from 'three';
import { SOUND_CONFIG, SOUND_STUBS } from '../config/sounds.js';

export class SoundManager {
  constructor(camera) {
    this.camera = camera;
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);

    this.loader = new THREE.AudioLoader();
    this.buffers = {};
    this.sounds = {};
    this.loopingSounds = {};
    this.audioPool = {};
    this.poolSize = 5;

    this.isFirstPerson = false;
    this.masterVolume = 1.0;

    this.positionalMusic = null;
    this.globalMusic = null;
    this.speaker = null;

    this.initialized = false;

    this.initAudioContext();
  }

  initAudioContext() {
    const resumeAudio = () => {
      if (this.listener.context.state === 'suspended') {
        this.listener.context.resume();
      }
    };

    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);
  }

  async loadSounds() {
    const allSounds = {
      ...SOUND_CONFIG.effects,
      background: SOUND_CONFIG.music.background
    };

    const loadPromises = Object.entries(allSounds).map(([id, config]) => {
      return this.loadSound(id, config);
    });

    await Promise.all(loadPromises);
    this.createAudioPools();
    this.initialized = true;
  }

  createAudioPools() {
    Object.keys(SOUND_CONFIG.effects).forEach(soundId => {
      const buffer = this.buffers[soundId];
      if (buffer && !SOUND_CONFIG.effects[soundId].loop) {
        this.audioPool[soundId] = [];
        for (let i = 0; i < this.poolSize; i++) {
          const audio = new THREE.Audio(this.listener);
          audio.setBuffer(buffer);
          this.audioPool[soundId].push(audio);
        }
      }
    });
  }

  getPooledAudio(soundId) {
    const pool = this.audioPool[soundId];
    if (!pool) return null;

    for (const audio of pool) {
      if (!audio.isPlaying) {
        return audio;
      }
    }

    const audio = new THREE.Audio(this.listener);
    audio.setBuffer(this.buffers[soundId]);
    pool.push(audio);
    return audio;
  }

  loadSound(soundId, config) {
    return new Promise((resolve) => {
      this.loader.load(
        config.path,
        (buffer) => {
          this.buffers[soundId] = buffer;
          resolve(true);
        },
        undefined,
        () => {
          if (SOUND_STUBS.enabled) {
            if (SOUND_STUBS.logMissing) {
              console.warn(`[SoundManager] Stub mode: ${soundId} (${config.path})`);
            }
            this.buffers[soundId] = null;
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  }

  setupBackgroundMusic(speaker) {
    this.speaker = speaker;
    const config = SOUND_CONFIG.music.background;

    this.positionalMusic = new THREE.PositionalAudio(this.listener);
    this.positionalMusic.setRefDistance(config.positional.refDistance);
    this.positionalMusic.setMaxDistance(config.positional.maxDistance);
    this.positionalMusic.setRolloffFactor(config.positional.rolloffFactor);
    this.positionalMusic.setLoop(true);
    this.positionalMusic.setVolume(0);

    speaker.attachAudio(this.positionalMusic);

    this.globalMusic = new THREE.Audio(this.listener);
    this.globalMusic.setLoop(true);
    this.globalMusic.setVolume(config.volume);

    const buffer = this.buffers['background'];
    if (buffer) {
      this.positionalMusic.setBuffer(buffer);
      this.globalMusic.setBuffer(buffer);
    }
  }

  playBackgroundMusic() {
    const buffer = this.buffers['background'];

    if (buffer === null) {
      if (SOUND_STUBS.logMissing) {
        console.log('[SoundManager] Playing (stub): background music');
      }
      return;
    }

    if (!buffer) return;

    if (this.isFirstPerson) {
      if (!this.positionalMusic.isPlaying) {
        this.positionalMusic.play();
      }
      this.positionalMusic.setVolume(SOUND_CONFIG.music.background.volume);
      this.globalMusic.setVolume(0);
    } else {
      if (!this.globalMusic.isPlaying) {
        this.globalMusic.play();
      }
      this.globalMusic.setVolume(SOUND_CONFIG.music.background.volume);
      this.positionalMusic.setVolume(0);
    }
  }

  stopBackgroundMusic() {
    if (this.positionalMusic?.isPlaying) {
      this.positionalMusic.stop();
    }
    if (this.globalMusic?.isPlaying) {
      this.globalMusic.stop();
    }
  }

  setFirstPersonMode(enabled) {
    this.isFirstPerson = enabled;
    const volume = SOUND_CONFIG.music.background.volume;

    if (enabled) {
      if (this.globalMusic) this.globalMusic.setVolume(0);
      if (this.positionalMusic) {
        this.positionalMusic.setVolume(volume);
        if (this.buffers['background'] && !this.positionalMusic.isPlaying) {
          this.positionalMusic.play();
        }
      }
    } else {
      if (this.positionalMusic) this.positionalMusic.setVolume(0);
      if (this.globalMusic) {
        this.globalMusic.setVolume(volume);
        if (this.buffers['background'] && !this.globalMusic.isPlaying) {
          this.globalMusic.play();
        }
      }
    }
  }

  play(soundId) {
    const config = SOUND_CONFIG.effects[soundId];
    if (!config) {
      console.warn(`[SoundManager] Unknown sound: ${soundId}`);
      return null;
    }

    const buffer = this.buffers[soundId];

    if (buffer === null) {
      if (SOUND_STUBS.logMissing) {
        console.log(`[SoundManager] Playing (stub): ${soundId}`);
      }
      return null;
    }

    if (!buffer) return null;

    const sound = this.getPooledAudio(soundId);
    if (!sound) return null;

    sound.setVolume(config.volume * this.masterVolume);
    sound.setLoop(false);
    if (sound.isPlaying) sound.stop();
    sound.play();

    return sound;
  }

  playLoop(soundId) {
    if (this.loopingSounds[soundId]) {
      return this.loopingSounds[soundId];
    }

    const config = SOUND_CONFIG.effects[soundId];
    if (!config) {
      console.warn(`[SoundManager] Unknown sound: ${soundId}`);
      return null;
    }

    const buffer = this.buffers[soundId];

    if (buffer === null) {
      if (SOUND_STUBS.logMissing) {
        console.log(`[SoundManager] Playing loop (stub): ${soundId}`);
      }
      this.loopingSounds[soundId] = { stub: true };
      return null;
    }

    if (!buffer) return null;

    const sound = new THREE.Audio(this.listener);
    sound.setBuffer(buffer);
    sound.setVolume(config.volume * this.masterVolume);
    sound.setLoop(true);
    sound.play();

    this.loopingSounds[soundId] = sound;
    return sound;
  }

  stop(soundId) {
    const sound = this.loopingSounds[soundId];

    if (sound) {
      if (sound.stub) {
        if (SOUND_STUBS.logMissing) {
          console.log(`[SoundManager] Stopping (stub): ${soundId}`);
        }
      } else if (sound.isPlaying) {
        sound.stop();
        sound.disconnect();
      }
      delete this.loopingSounds[soundId];
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    Object.values(this.loopingSounds).forEach(sound => {
      if (sound && !sound.stub) {
        const config = Object.values(SOUND_CONFIG.effects).find(c =>
          this.buffers[Object.keys(this.buffers).find(k => this.buffers[k] === sound.buffer)]
        );
        if (config) {
          sound.setVolume(config.volume * this.masterVolume);
        }
      }
    });
  }

  update() {
  }
}
