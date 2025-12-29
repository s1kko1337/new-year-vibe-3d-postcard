import * as THREE from 'three';

export class FirstPersonController {
  constructor(camera) {
    this.camera = camera;
    this.active = false;
    this.position = new THREE.Vector3(-5, 1.7, 15);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = { x: 0, y: 0 };
    this.keys = {};
    this.speed = 0.12;
    this.jumpForce = 0.25;
    this.gravity = 0.015;
    this.groundLevel = 1.7;
    this.isGrounded = true;
    this.collisionManager = null;
    this.onDeactivate = null;
    this.playerRadius = 0.4;

    // Поддержка опьянения
    this.canMove = true;
    this.drunkSway = { x: 0, y: 0, roll: 0 };

    this.bindEvents();
  }

  setCollisionManager(manager) {
    this.collisionManager = manager;
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space' && this.active) {
        e.preventDefault();
        if (this.isGrounded) {
          this.jump();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.active || !document.pointerLockElement) return;

      this.rotation.y -= e.movementX * 0.002;
      this.rotation.x -= e.movementY * 0.002;
      this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    });

    document.addEventListener('pointerlockchange', () => {
      if (!document.pointerLockElement && this.active) {
        this.active = false;
        if (this.onDeactivate) this.onDeactivate();
      }
    });
  }

  jump() {
    if (!this.isGrounded) return;
    this.velocity.y = this.jumpForce;
    this.isGrounded = false;
  }

  activate() {
    this.active = true;
    document.body.requestPointerLock();
  }

  deactivate() {
    this.active = false;
    document.exitPointerLock();
  }

  toggle() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
    return this.active;
  }

  isActive() {
    return this.active;
  }

  update() {
    if (!this.active) return;

    // Движение только если разрешено
    if (this.canMove) {
      const moveX = Math.sin(this.rotation.y);
      const moveZ = Math.cos(this.rotation.y);

      let deltaX = 0;
      let deltaZ = 0;

      if (this.keys['KeyW']) {
        deltaX -= moveX * this.speed;
        deltaZ -= moveZ * this.speed;
      }
      if (this.keys['KeyS']) {
        deltaX += moveX * this.speed;
        deltaZ += moveZ * this.speed;
      }
      if (this.keys['KeyA']) {
        deltaX -= moveZ * this.speed;
        deltaZ += moveX * this.speed;
      }
      if (this.keys['KeyD']) {
        deltaX += moveZ * this.speed;
        deltaZ -= moveX * this.speed;
      }

      const newX = this.position.x + deltaX;
      const newZ = this.position.z + deltaZ;

      if (this.collisionManager) {
        const resolved = this.collisionManager.resolveCollision(
          this.position.x,
          this.position.z,
          newX,
          newZ,
          this.playerRadius
        );
        this.position.x = resolved.x;
        this.position.z = resolved.z;
      } else {
        this.position.x = newX;
        this.position.z = newZ;
      }

      this.position.x = Math.max(-28, Math.min(28, this.position.x));
      this.position.z = Math.max(-28, Math.min(28, this.position.z));

      this.velocity.y -= this.gravity;
      this.position.y += this.velocity.y;

      if (this.position.y <= this.groundLevel) {
        this.position.y = this.groundLevel;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.rotation.y + this.drunkSway.y;
    this.camera.rotation.x = this.rotation.x + this.drunkSway.x;
    this.camera.rotation.z = this.drunkSway.roll;
  }
}
