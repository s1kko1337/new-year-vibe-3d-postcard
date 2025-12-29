import * as THREE from 'three';

export class Snow {
  constructor(scene) {
    this.scene = scene;
    this.stormActive = false;
    this.stormParticles = null;

    this.particles = this.createSnowParticles(3000);
    scene.add(this.particles);
  }

  createSnowParticles(count) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      velocities[i] = 0.02 + Math.random() * 0.03;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.velocities = velocities;

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.8
    });

    return new THREE.Points(geometry, material);
  }

  startStorm() {
    if (this.stormActive) return;

    this.stormActive = true;
    this.stormParticles = this.createSnowParticles(1500);
    this.scene.add(this.stormParticles);
  }

  stopStorm() {
    if (!this.stormActive) return;

    this.stormActive = false;
    if (this.stormParticles) {
      this.scene.remove(this.stormParticles);
      this.stormParticles.geometry.dispose();
      this.stormParticles.material.dispose();
      this.stormParticles = null;
    }
  }

  toggleStorm() {
    if (this.stormActive) {
      this.stopStorm();
    } else {
      this.startStorm();
    }
    return this.stormActive;
  }

  updateParticles(particles, multiplier = 1) {
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.geometry.userData.velocities;

    for (let i = 0; i < velocities.length; i++) {
      positions[i * 3 + 1] -= velocities[i] * multiplier;
      positions[i * 3] += (Math.random() - 0.5) * 0.05 * multiplier;

      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 50;
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }

    particles.geometry.attributes.position.needsUpdate = true;
  }

  update() {
    this.updateParticles(this.particles, 1);

    if (this.stormActive && this.stormParticles) {
      this.updateParticles(this.stormParticles, 2.5);
    }
  }

  isStormActive() {
    return this.stormActive;
  }
}
