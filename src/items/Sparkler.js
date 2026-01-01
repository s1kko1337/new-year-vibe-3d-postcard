import * as THREE from 'three';

export class Sparkler {
  constructor() {
    this.mesh = new THREE.Group();
    this.sparks = [];
    this.sparkPool = [];
    this.sparkPoolSize = 100;
    this.sparkPoint = null;
    this.light = null;
    this.active = false;
    this.burnProgress = 0;
    this.burnSpeed = 0.0005;
    this.soundManager = null;

    this.create();
    this.createSparkPool();
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

    this.mesh.rotation.x = -0.5;
    this.mesh.rotation.z = 0.2;
    this.mesh.position.set(0.05, 0, -0.15);
  }

  createSparkPool() {
    const colors = [0xffdd44, 0xffaa00, 0xffffff, 0xff8800];

    for (let i = 0; i < this.sparkPoolSize; i++) {
      const sparkGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(3);
      sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const sparkMat = new THREE.PointsMaterial({
        color: colors[i % colors.length],
        size: 0.02,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });

      const spark = new THREE.Points(sparkGeo, sparkMat);
      spark.visible = false;
      spark.userData = {
        velocity: new THREE.Vector3(),
        life: 0,
        inUse: false
      };

      this.sparkPool.push(spark);
      this.mesh.add(spark);
    }
  }

  getSparkFromPool() {
    for (const spark of this.sparkPool) {
      if (!spark.userData.inUse) {
        spark.userData.inUse = true;
        spark.visible = true;
        return spark;
      }
    }
    return null;
  }

  returnSparkToPool(spark) {
    spark.userData.inUse = false;
    spark.visible = false;
    spark.material.opacity = 0;
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
      const pos = spark.geometry.attributes.position.array;

      pos[0] += spark.userData.velocity.x;
      pos[1] += spark.userData.velocity.y;
      pos[2] += spark.userData.velocity.z;
      spark.geometry.attributes.position.needsUpdate = true;

      spark.userData.velocity.y -= 0.002;
      spark.userData.life -= 0.05;
      spark.material.opacity = Math.max(0, spark.userData.life);

      if (spark.userData.life <= 0) {
        this.returnSparkToPool(spark);
        this.sparks.splice(i, 1);
      }
    }
  }

  createSparks() {
    const sparkCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < sparkCount; i++) {
      const spark = this.getSparkFromPool();
      if (!spark) continue;

      const pos = spark.geometry.attributes.position.array;
      pos[0] = this.sparkPoint.position.x;
      pos[1] = this.sparkPoint.position.y;
      pos[2] = this.sparkPoint.position.z;
      spark.geometry.attributes.position.needsUpdate = true;

      spark.material.size = 0.015 + Math.random() * 0.02;
      spark.material.opacity = 1;

      const speed = 0.02 + Math.random() * 0.04;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      spark.userData.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 0.02,
        Math.cos(phi) * speed
      );
      spark.userData.life = 0.5 + Math.random() * 0.5;

      this.sparks.push(spark);
    }
  }

  isConsumed() {
    return this.burnProgress >= 1;
  }
}
