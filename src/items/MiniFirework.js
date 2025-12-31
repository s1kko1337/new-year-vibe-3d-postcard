import * as THREE from 'three';

export class MiniFirework {
  constructor() {
    this.mesh = new THREE.Group();
    this.placed = false;
    this.count = 3;

    this.create();
  }

  create() {
    const tubeGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.15, 8);
    const tubeMat = new THREE.MeshLambertMaterial({ color: 0xc41e3a });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.y = 0.075;
    this.mesh.add(tube);

    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.036, 0.01, 8),
        stripeMat
      );
      stripe.position.y = 0.03 + i * 0.05;
      this.mesh.add(stripe);
    }

    const capGeo = new THREE.ConeGeometry(0.035, 0.04, 8);
    const capMat = new THREE.MeshLambertMaterial({ color: 0x1e90ff });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.17;
    this.mesh.add(cap);

    const fuseGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.05, 4);
    const fuseMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const fuse = new THREE.Mesh(fuseGeo, fuseMat);
    fuse.position.set(0.02, 0.15, 0);
    fuse.rotation.z = 0.5;
    this.mesh.add(fuse);

    this.mesh.position.set(0, -0.05, -0.1);
  }

  activate() {
    this.updateAppearance();
  }

  deactivate() {
  }

  updateAppearance() {
  }

  use(playerPosition, playerRotation) {
    if (this.count <= 0) return null;

    this.count--;
    this.updateAppearance();

    const placeDistance = 1.5;
    const placeX = playerPosition.x - Math.sin(playerRotation.y) * placeDistance;
    const placeZ = playerPosition.z - Math.cos(playerRotation.y) * placeDistance;

    return {
      type: 'placeFirework',
      position: new THREE.Vector3(placeX, 0, placeZ)
    };
  }

  update() {
  }

  isConsumed() {
    return this.count <= 0;
  }

  getCount() {
    return this.count;
  }
}
