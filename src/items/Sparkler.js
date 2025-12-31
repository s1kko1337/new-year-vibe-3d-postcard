import * as THREE from 'three';

export class Sparkler {
  constructor() {
    this.mesh = new THREE.Group();
    this.sparks = [];
    this.sparkPoint = null;
    this.light = null;
    this.active = false;
    this.burnProgress = 0;
    this.burnSpeed = 0.0005;
    this.sparkMaterial = null;
    this.soundManager = null;

    this.create();
  }

  setSoundManager(soundManager) {
    this.soundManager = soundManager;
  }

  create() {
    const wireGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.3, 4);
    const wireMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.y = 0.15;
    this.mesh.add(wire);

    const coatingGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6);
    const coatingMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    this.coating = new THREE.Mesh(coatingGeo, coatingMat);
    this.coating.position.y = 0.2;
    this.mesh.add(this.coating);

    this.sparkPoint = new THREE.Object3D();
    this.sparkPoint.position.y = 0.3;
    this.mesh.add(this.sparkPoint);

    this.light = new THREE.PointLight(0xffaa00, 0, 2);
    this.light.position.copy(this.sparkPoint.position);
    this.mesh.add(this.light);

    this.sparkMaterial = new THREE.PointsMaterial({
      color: 0xffdd44,
      size: 0.03,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });

    this.mesh.rotation.x = -0.5;
    this.mesh.rotation.z = 0.2;
    this.mesh.position.set(0.05, 0, -0.15);
  }

  activate() {
    this.active = true;
    this.light.intensity = 1;
    if (this.soundManager && this.burnProgress < 1) {
      this.soundManager.playLoop('sparkler');
    }
  }

  deactivate() {
    this.active = false;
    this.light.intensity = 0;
    if (this.soundManager) {
      this.soundManager.stop('sparkler');
    }
  }

  use() {
    return null;
  }

  update() {
    if (!this.active) return;

    this.burnProgress += this.burnSpeed;

    const burnHeight = 0.3 - (this.burnProgress * 0.2);
    this.sparkPoint.position.y = Math.max(0.1, burnHeight);
    this.light.position.y = this.sparkPoint.position.y;

    const coatingScale = Math.max(0, 1 - this.burnProgress);
    this.coating.scale.y = coatingScale;
    this.coating.position.y = 0.1 + coatingScale * 0.1;

    if (this.burnProgress < 1) {
      this.createSparks();
      this.light.intensity = 0.8 + Math.random() * 0.4;
    } else {
      this.light.intensity = 0;
      if (this.soundManager) {
        this.soundManager.stop('sparkler');
      }
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];

      spark.position.add(spark.userData.velocity);
      spark.userData.velocity.y -= 0.002;
      spark.userData.life -= 0.05;
      spark.material.opacity = spark.userData.life;

      if (spark.userData.life <= 0) {
        this.mesh.remove(spark);
        spark.geometry.dispose();
        spark.material.dispose();
        this.sparks.splice(i, 1);
      }
    }
  }

  createSparks() {
    const sparkCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < sparkCount; i++) {
      const sparkGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(3);
      positions[0] = this.sparkPoint.position.x;
      positions[1] = this.sparkPoint.position.y;
      positions[2] = this.sparkPoint.position.z;
      sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const colors = [0xffdd44, 0xffaa00, 0xffffff, 0xff8800];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const sparkMat = new THREE.PointsMaterial({
        color: color,
        size: 0.015 + Math.random() * 0.02,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending
      });

      const spark = new THREE.Points(sparkGeo, sparkMat);

      const speed = 0.02 + Math.random() * 0.04;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      spark.userData = {
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed + 0.02,
          Math.cos(phi) * speed
        ),
        life: 0.5 + Math.random() * 0.5
      };

      this.mesh.add(spark);
      this.sparks.push(spark);
    }
  }

  isConsumed() {
    return this.burnProgress >= 1;
  }
}
