import * as THREE from 'three';

export class Speaker {
  constructor() {
    this.mesh = new THREE.Group();
    this.positionalAudio = null;
    this.ledLight = null;
    this.ledPhase = 0;

    this.create();
  }

  create() {
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const grillMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const coneMat = new THREE.MeshLambertMaterial({ color: 0x333333 });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.4, 0.5),
      bodyMat
    );
    body.position.y = 0.7;
    body.castShadow = true;
    this.mesh.add(body);

    const grill = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.2, 0.05),
      grillMat
    );
    grill.position.set(0, 0.7, 0.26);
    this.mesh.add(grill);

    const wooferRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.03, 8, 16),
      coneMat
    );
    wooferRing.position.set(0, 0.45, 0.27);
    this.mesh.add(wooferRing);

    const wooferCone = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 16),
      new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    wooferCone.position.set(0, 0.45, 0.28);
    this.mesh.add(wooferCone);

    const wooferCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x222222 })
    );
    wooferCenter.position.set(0, 0.45, 0.30);
    this.mesh.add(wooferCenter);

    const tweeterRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.02, 8, 12),
      coneMat
    );
    tweeterRing.position.set(0, 1.0, 0.27);
    this.mesh.add(tweeterRing);

    const tweeterDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x555555 })
    );
    tweeterDome.position.set(0, 1.0, 0.28);
    tweeterDome.scale.z = 0.5;
    this.mesh.add(tweeterDome);

    const ledMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 6),
      ledMat
    );
    led.position.set(0.3, 1.25, 0.26);
    this.mesh.add(led);

    this.ledLight = new THREE.PointLight(0x00ff00, 0.3, 1);
    this.ledLight.position.copy(led.position);
    this.mesh.add(this.ledLight);

    const baseMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.1, 0.6),
      baseMat
    );
    base.position.y = 0.05;
    this.mesh.add(base);

    const logoMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const logo = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.04, 0.01),
      logoMat
    );
    logo.position.set(0, 1.3, 0.26);
    this.mesh.add(logo);

    this.mesh.position.set(4, 0, 3);
  }

  attachAudio(positionalAudio) {
    this.positionalAudio = positionalAudio;
    this.mesh.add(positionalAudio);
  }

  getPosition() {
    return this.mesh.position;
  }

  update() {
    this.ledPhase += 0.05;
    const pulse = 0.2 + Math.sin(this.ledPhase) * 0.1;
    if (this.ledLight) {
      this.ledLight.intensity = pulse;
    }
  }

  getMesh() {
    return this.mesh;
  }
}
