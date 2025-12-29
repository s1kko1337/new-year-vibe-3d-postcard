import * as THREE from 'three';
import { PIXEL_RATIO } from '../config/constants.js';

export class PixelRenderer {
  constructor() {
    this.renderer = this.createRenderer();
    this.renderTarget = this.createRenderTarget();
    this.outputScene = new THREE.Scene();
    this.outputCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.outputQuad = this.createOutputQuad();
    this.outputScene.add(this.outputQuad);

    this.setupResize();
  }

  createRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    return renderer;
  }

  createRenderTarget() {
    return new THREE.WebGLRenderTarget(
      Math.floor(window.innerWidth / PIXEL_RATIO),
      Math.floor(window.innerHeight / PIXEL_RATIO),
      {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter
      }
    );
  }

  createOutputQuad() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ map: this.renderTarget.texture });
    return new THREE.Mesh(geometry, material);
  }

  setupResize() {
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderTarget.setSize(
      Math.floor(window.innerWidth / PIXEL_RATIO),
      Math.floor(window.innerHeight / PIXEL_RATIO)
    );
  }

  render(scene, camera) {
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(scene, camera);

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.outputScene, this.outputCamera);
  }

  getDomElement() {
    return this.renderer.domElement;
  }
}
