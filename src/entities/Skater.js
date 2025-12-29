import * as THREE from 'three';
import { Person } from './Person.js';

export class Skater extends Person {
  constructor(color, centerX, centerZ) {
    super(color);
    this.centerX = centerX;
    this.centerZ = centerZ;
    this.radius = 2 + Math.random() * 4;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.005 + Math.random() * 0.01;
    this.direction = Math.random() > 0.5 ? 1 : -1;
  }

  update() {
    this.angle += this.speed * this.direction;
    this.mesh.position.x = this.centerX + Math.cos(this.angle) * this.radius;
    this.mesh.position.z = this.centerZ + Math.sin(this.angle) * this.radius;
    this.mesh.rotation.y = this.angle + (this.direction > 0 ? Math.PI / 2 : -Math.PI / 2);
  }
}
