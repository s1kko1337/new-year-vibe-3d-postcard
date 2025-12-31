export const SOUND_CONFIG = {
  music: {
    background: {
      path: './assets/sounds/music/background.mp3',
      loop: true,
      volume: 0.7,
      positional: {
        refDistance: 5,
        maxDistance: 50,
        rolloffFactor: 1
      }
    }
  },
  effects: {
    cork: {
      path: './assets/sounds/effects/cork-pop.mp3',
      volume: 1.0,
      loop: false
    },
    drink: {
      path: './assets/sounds/effects/drinking.mp3',
      volume: 0.8,
      loop: false
    },
    sparkler: {
      path: './assets/sounds/effects/sparkler-loop.mp3',
      volume: 0.5,
      loop: true
    },
    fireworkLaunch: {
      path: './assets/sounds/effects/firework-launch.mp3',
      volume: 0.9,
      loop: false
    },
    fireworkBoom: {
      path: './assets/sounds/effects/firework-boom.mp3',
      volume: 1.0,
      loop: false
    },
    wind: {
      path: './assets/sounds/effects/wind-loop.mp3',
      volume: 0.6,
      loop: true
    },
    footstep: {
      path: './assets/sounds/effects/footstep.mp3',
      volume: 0.3,
      loop: true
    }
  }
};

export const SOUND_STUBS = {
  enabled: true,
  logMissing: true
};
