import * as THREE from 'three';
import { COLORS } from '../config/colors.js';

export class ChristmasTree {
  constructor() {
    this.mesh = new THREE.Group();
    this.lights = [];
    this.startTime = performance.now();
    this.create();
  }

  create() {
    const trunkGeometry = new THREE.CylinderGeometry(0.8, 1, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: COLORS.trunk });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    this.mesh.add(trunk);

    const treeMaterial = new THREE.MeshLambertMaterial({ color: COLORS.treeDark });
    const levels = [
      { radius: 5, height: 4, y: 4 },
      { radius: 4, height: 4, y: 7 },
      { radius: 3, height: 4, y: 10 },
      { radius: 2, height: 3, y: 12.5 },
      { radius: 1, height: 2, y: 14.5 }
    ];

    levels.forEach(level => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(level.radius, level.height, 8),
        treeMaterial
      );
      cone.position.y = level.y;
      cone.castShadow = true;
      this.mesh.add(cone);
    });

    const starGeometry = new THREE.OctahedronGeometry(0.8, 0);
    const starMaterial = new THREE.MeshBasicMaterial({ color: COLORS.gold });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.y = 16;
    star.rotation.y = Math.PI / 4;
    this.mesh.add(star);

    this.createLights();
  }

  createLights() {
    const lightGeometry = new THREE.SphereGeometry(0.15, 4, 4);

    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 8;
      const height = 3 + (i / 40) * 12;
      const radius = 5 - (height / 15) * 4;
      const color = COLORS.lights[i % COLORS.lights.length];

      const lightMaterial = new THREE.MeshBasicMaterial({ color });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);

      this.lights.push({
        mesh: light,
        baseColor: color,
        phase: Math.random() * Math.PI * 2
      });

      this.mesh.add(light);
    }
  }

  update() {
    const time = (performance.now() - this.startTime) / 1000;
    this.lights.forEach(light => {
      const intensity = 0.5 + 0.5 * Math.sin(time * 3 + light.phase);
      const color = new THREE.Color(light.baseColor);
      color.multiplyScalar(0.3 + intensity * 0.7);
      light.mesh.material.color = color;
    });
  }
}
