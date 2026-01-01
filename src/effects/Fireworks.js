import * as THREE from 'three';
import { COLORS } from '../config/colors.js';

class FireworkBurst {
  constructor(x, y, z, color) {
    this.particles = this.createParticles(x, y, z, color);
    this.life = 1.0;
    this.decay = 0.015;
  }

  createParticles(x, y, z, color) {
    const count = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.2 + Math.random() * 0.3;

      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.velocities = velocities;

    const material = new THREE.PointsMaterial({
      color,
      size: 0.5,
      transparent: true,
      opacity: 1
    });

    return new THREE.Points(geometry, material);
  }

  update() {
    const positions = this.particles.geometry.attributes.position.array;
    const velocities = this.particles.geometry.userData.velocities;

    for (let i = 0; i < velocities.length; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;
      velocities[i].y -= 0.01;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.life -= this.decay;
    this.particles.material.opacity = this.life;

    return this.life > 0;
  }

  dispose() {
    this.particles.geometry.dispose();
    this.particles.material.dispose();
  }
}

export class Fireworks {
  constructor(scene) {
    this.scene = scene;
    this.bursts = [];
    this.active = false;
    this.textSprite = null;
    this.soundManager = null;
  }

  setSoundManager(soundManager) {
    this.soundManager = soundManager;
  }

  start() {
    if (this.active) return;

    this.active = true;
    this.showText();
    this.launchSequence();
  }

  stop() {
    this.active = false;
    this.hideText();

    this.bursts.forEach(burst => {
      this.scene.remove(burst.particles);
      burst.dispose();
    });
    this.bursts = [];
  }

  toggle() {
    if (this.active) {
      this.stop();
    } else {
      this.start();
    }
    return this.active;
  }

  showText() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 180px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('С Новым 2026 Годом!', 1024, 256);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 4;
    ctx.strokeText('С Новым 2026 Годом!', 1024, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    this.textSprite = new THREE.Sprite(material);
    this.textSprite.scale.set(40, 10, 1);
    this.textSprite.position.set(0, 22, 0);
    this.scene.add(this.textSprite);
  }

  hideText() {
    if (this.textSprite) {
      this.scene.remove(this.textSprite);
      this.textSprite.material.map.dispose();
      this.textSprite.material.dispose();
      this.textSprite = null;
    }
  }

  launchSequence() {
    if (!this.active) return;

    const colors = COLORS.fireworks;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = (Math.random() - 0.5) * 40;
    const y = 20 + Math.random() * 15;
    const z = (Math.random() - 0.5) * 40;

    this.createBurst(x, y, z, color);

    setTimeout(() => this.launchSequence(), 300 + Math.random() * 500);
  }

  createBurst(x, y, z, color) {
    const burst = new FireworkBurst(x, y, z, color);
    this.bursts.push(burst);
    this.scene.add(burst.particles);

    if (this.soundManager) {
      this.soundManager.play('fireworkBoom');
    }
  }

  update() {
    this.bursts = this.bursts.filter(burst => {
      const alive = burst.update();
      if (!alive) {
        this.scene.remove(burst.particles);
        burst.dispose();
      }
      return alive;
    });
  }

  isActive() {
    return this.active;
  }
}
