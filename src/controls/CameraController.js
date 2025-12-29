import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
  constructor(domElement) {
    this.domElement = domElement;

    this.orthoCamera = this.createOrthoCamera();
    this.perspectiveCamera = this.createPerspectiveCamera();
    this.activeCamera = this.orthoCamera;

    this.orbitControls = new OrbitControls(this.orthoCamera, domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.minZoom = 0.5;
    this.orbitControls.maxZoom = 3;
    this.orbitControls.maxPolarAngle = Math.PI / 2.2;
    this.orbitControls.target.set(0, 0, 0);

    this.setupResize();
  }

  createOrthoCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 40;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  createPerspectiveCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.7, 10);
    return camera;
  }

  setupResize() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 40;

    this.orthoCamera.left = frustumSize * aspect / -2;
    this.orthoCamera.right = frustumSize * aspect / 2;
    this.orthoCamera.top = frustumSize / 2;
    this.orthoCamera.bottom = frustumSize / -2;
    this.orthoCamera.updateProjectionMatrix();

    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();
  }

  setFirstPersonMode(enabled) {
    if (enabled) {
      this.activeCamera = this.perspectiveCamera;
      this.orbitControls.enabled = false;
    } else {
      this.activeCamera = this.orthoCamera;
      this.orbitControls.enabled = true;
    }
  }

  update() {
    if (this.orbitControls.enabled) {
      this.orbitControls.update();
    }
  }

  getActiveCamera() {
    return this.activeCamera;
  }

  getOrthoCamera() {
    return this.orthoCamera;
  }

  getPerspectiveCamera() {
    return this.perspectiveCamera;
  }
}
