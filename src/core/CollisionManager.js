import { BUILDINGS } from '../config/constants.js';

export class CollisionManager {
  constructor() {
    this.colliders = [];
    this.initBuildingColliders();
  }

  initBuildingColliders() {
    BUILDINGS.forEach(b => {
      this.colliders.push({
        type: 'box',
        x: b.x,
        z: b.z,
        width: b.width + 1,
        depth: b.depth + 1
      });
    });

    this.colliders.push({
      type: 'cylinder',
      x: 0,
      z: 0,
      radius: 5.5,
      height: 20
    });
  }

  addColliders(newColliders) {
    this.colliders.push(...newColliders);
  }

  addCollider(collider) {
    this.colliders.push(collider);
  }

  checkCollision(x, z, radius = 0.5) {
    for (const col of this.colliders) {
      if (col.type === 'box') {
        const halfW = col.width / 2 + radius;
        const halfD = col.depth / 2 + radius;

        if (
          x > col.x - halfW &&
          x < col.x + halfW &&
          z > col.z - halfD &&
          z < col.z + halfD
        ) {
          return true;
        }
      } else if (col.type === 'cylinder') {
        const dx = x - col.x;
        const dz = z - col.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < col.radius + radius) {
          return true;
        }
      }
    }
    return false;
  }

  resolveCollision(oldX, oldZ, newX, newZ, radius = 0.5) {
    if (!this.checkCollision(newX, newZ, radius)) {
      return { x: newX, z: newZ };
    }

    if (!this.checkCollision(newX, oldZ, radius)) {
      return { x: newX, z: oldZ };
    }

    if (!this.checkCollision(oldX, newZ, radius)) {
      return { x: oldX, z: newZ };
    }

    return { x: oldX, z: oldZ };
  }
}
