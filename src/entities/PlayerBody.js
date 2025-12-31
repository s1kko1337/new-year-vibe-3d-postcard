import * as THREE from 'three';

export class PlayerBody {
  constructor(camera) {
    this.camera = camera;
    this.group = new THREE.Group();
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;
    this.walkPhase = 0;
    this.isWalking = false;
    this.itemHolder = null;

    this.armsGroup = new THREE.Group();
    this.legsGroup = new THREE.Group();

    this.create();
  }

  create() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const sleeveMat = new THREE.MeshLambertMaterial({ color: 0x2e5a3e });
    const gloveMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

    this.leftArm = this.createArm(skinMat, sleeveMat, gloveMat, -1);
    this.armsGroup.add(this.leftArm);

    this.rightArm = this.createArm(skinMat, sleeveMat, gloveMat, 1);
    this.armsGroup.add(this.rightArm);

    this.itemHolder = new THREE.Group();
    this.itemHolder.position.set(0, 0.08, -0.12);
    this.rightArm.add(this.itemHolder);

    this.leftLeg = this.createLeg(pantsMat, shoeMat);
    this.leftLeg.position.set(-0.12, 0, 0);
    this.legsGroup.add(this.leftLeg);

    this.rightLeg = this.createLeg(pantsMat, shoeMat);
    this.rightLeg.position.set(0.12, 0, 0);
    this.legsGroup.add(this.rightLeg);

    this.group.add(this.armsGroup);
    this.group.add(this.legsGroup);
  }

  createArm(skinMat, sleeveMat, gloveMat, side) {
    const arm = new THREE.Group();

    const upperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.25, 0.12),
      sleeveMat
    );
    upperArm.position.y = -0.12;
    arm.add(upperArm);

    const forearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.22, 0.10),
      sleeveMat
    );
    forearm.position.y = -0.35;
    arm.add(forearm);

    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.12, 0.09),
      gloveMat
    );
    hand.position.y = -0.52;
    arm.add(hand);

    if (side === -1) {
      arm.position.set(-0.35, -0.45, -0.5);
      arm.rotation.x = 0.4;
      arm.rotation.z = 0.2;
    } else {
      arm.position.set(0.32, -0.42, -0.45);
      arm.rotation.x = 0.5;
      arm.rotation.z = -0.15;
    }

    return arm;
  }

  createLeg(pantsMat, shoeMat) {
    const leg = new THREE.Group();

    const thigh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.35, 0.14),
      pantsMat
    );
    thigh.position.y = -0.17;
    leg.add(thigh);

    const shin = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.35, 0.12),
      pantsMat
    );
    shin.position.y = -0.52;
    leg.add(shin);

    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.22),
      shoeMat
    );
    shoe.position.set(0, -0.75, 0.04);
    leg.add(shoe);

    return leg;
  }

  setWalking(walking) {
    this.isWalking = walking;
    if (!walking) {
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
    }
  }

  update() {
    this.armsGroup.position.copy(this.camera.position);
    this.armsGroup.rotation.order = 'YXZ';
    this.armsGroup.rotation.y = this.camera.rotation.y;
    this.armsGroup.rotation.x = this.camera.rotation.x;

    this.legsGroup.position.set(
      this.camera.position.x,
      this.camera.position.y - 1.0,
      this.camera.position.z
    );
    this.legsGroup.rotation.y = this.camera.rotation.y;

    if (this.isWalking) {
      this.walkPhase += 0.18;
      const swing = Math.sin(this.walkPhase) * 0.5;

      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;

      const armSwing = Math.sin(this.walkPhase) * 0.08;
      this.leftArm.rotation.z = 0.2 + armSwing;
      this.rightArm.rotation.z = -0.15 - armSwing;
    }
  }

  getItemHolder() {
    return this.itemHolder;
  }

  getMesh() {
    return this.group;
  }

  getRightArm() {
    return this.rightArm;
  }
}
