import * as THREE from 'three';

export class Car {
  constructor(color, road, startPos) {
    this.mesh = this.createMesh(color);
    this.road = road;
    this.speed = (road === 'horizontal' ? 0.05 : 0.04) + Math.random() * 0.03;
    this.direction = 1;

    if (road === 'horizontal') {
      this.mesh.position.set(startPos, 0, -20);
      this.mesh.rotation.y = 0;
    } else {
      this.mesh.position.set(-20, 0, startPos);
      this.mesh.rotation.y = Math.PI / 2;
    }
  }

  createMesh(color) {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 1.2), bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1), bodyMat);
    cabin.position.set(-0.2, 1.1, 0);
    cabin.castShadow = true;
    group.add(cabin);

    const windowMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb });
    const frontWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), windowMat);
    frontWindow.position.set(0.41, 1.1, 0);
    frontWindow.rotation.y = Math.PI / 2;
    group.add(frontWindow);

    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 8);

    [{ x: 0.6, z: 0.6 }, { x: 0.6, z: -0.6 }, { x: -0.6, z: 0.6 }, { x: -0.6, z: -0.6 }]
      .forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeom, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos.x, 0.25, pos.z);
        group.add(wheel);
      });

    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    [[1.05, 0.4], [1.05, -0.4]].forEach(([x, z]) => {
      const light = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.15), headlightMat);
      light.position.set(x, 0.6, z);
      group.add(light);
    });

    [[-1.05, 0.4], [-1.05, -0.4]].forEach(([x, z]) => {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.15), tailMat);
      tail.position.set(x, 0.6, z);
      group.add(tail);
    });

    return group;
  }

  update() {
    if (this.road === 'horizontal') {
      this.mesh.position.x += this.speed * this.direction;

      if (this.mesh.position.x > 35) {
        this.mesh.position.x = 35;
        this.direction = -1;
        this.mesh.rotation.y = Math.PI;
      } else if (this.mesh.position.x < -35) {
        this.mesh.position.x = -35;
        this.direction = 1;
        this.mesh.rotation.y = 0;
      }
    } else {
      this.mesh.position.z += this.speed * this.direction;

      if (this.mesh.position.z > 35) {
        this.mesh.position.z = 35;
        this.direction = -1;
        this.mesh.rotation.y = -Math.PI / 2;
      } else if (this.mesh.position.z < -35) {
        this.mesh.position.z = -35;
        this.direction = 1;
        this.mesh.rotation.y = Math.PI / 2;
      }
    }
  }
}
