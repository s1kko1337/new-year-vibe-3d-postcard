import * as THREE from 'three';

export class Person {
  constructor(color) {
    this.mesh = this.createMesh(color);
    this.targetX = 0;
    this.targetZ = 0;
    this.speed = 0.01 + Math.random() * 0.015;
    this.walkPhase = Math.random() * Math.PI * 2;
    this.waitTime = 0;
    this.onReachTarget = null;
  }

  createMesh(color) {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), mat);
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    const headMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMat);
    head.position.y = 1.85;
    head.castShadow = true;
    group.add(head);

    const hatMat = new THREE.MeshLambertMaterial({
      color: Math.random() > 0.5 ? 0xc41e3a : 0x1e4a6e
    });
    const hat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.3, 0.55), hatMat);
    hat.position.y = 2.2;
    group.add(hat);

    const legMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });

    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.3), legMat);
    leftLeg.position.set(-0.15, 0.5, 0);
    leftLeg.castShadow = true;
    leftLeg.name = 'leftLeg';
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.3), legMat);
    rightLeg.position.set(0.15, 0.5, 0);
    rightLeg.castShadow = true;
    rightLeg.name = 'rightLeg';
    group.add(rightLeg);

    return group;
  }

  setPosition(x, z) {
    this.mesh.position.set(x, 0, z);
    this.targetX = x;
    this.targetZ = z;
  }

  setTarget(x, z) {
    this.targetX = x;
    this.targetZ = z;
  }

  update() {
    if (this.waitTime > 0) {
      this.waitTime -= 0.016;
      return;
    }

    const dx = this.targetX - this.mesh.position.x;
    const dz = this.targetZ - this.mesh.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.5) {
      this.waitTime = 1 + Math.random() * 3;
      if (this.onReachTarget) {
        const newTarget = this.onReachTarget();
        this.targetX = newTarget.x;
        this.targetZ = newTarget.z;
      }
      return;
    }

    this.mesh.position.x += (dx / dist) * this.speed;
    this.mesh.position.z += (dz / dist) * this.speed;
    this.mesh.rotation.y = Math.atan2(dx, dz);

    this.walkPhase += 0.15;
    const legSwing = Math.sin(this.walkPhase) * 0.3;

    this.mesh.children.forEach(child => {
      if (child.name === 'leftLeg') child.rotation.x = legSwing;
      else if (child.name === 'rightLeg') child.rotation.x = -legSwing;
    });
  }
}
