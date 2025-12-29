import * as THREE from 'three';
import { COLORS } from '../config/colors.js';

export class SceneManager {
  constructor() {
    this.scene = this.createScene();
    this.setupLighting();
  }

  createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.sky);
    scene.fog = new THREE.Fog(COLORS.sky, 50, 150);
    return scene;
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    this.scene.add(ambient);

    const moonLight = new THREE.DirectionalLight(0xaaaaff, 0.3);
    moonLight.position.set(30, 50, 20);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 150;
    moonLight.shadow.camera.left = -50;
    moonLight.shadow.camera.right = 50;
    moonLight.shadow.camera.top = 50;
    moonLight.shadow.camera.bottom = -50;
    this.scene.add(moonLight);

    const treeLight = new THREE.PointLight(0xffaa44, 1, 30);
    treeLight.position.set(0, 8, 0);
    this.scene.add(treeLight);

    const warmLight1 = new THREE.PointLight(0xffcc66, 0.5, 20);
    warmLight1.position.set(-15, 3, -15);
    this.scene.add(warmLight1);

    const warmLight2 = new THREE.PointLight(0xffcc66, 0.5, 20);
    warmLight2.position.set(15, 3, 15);
    this.scene.add(warmLight2);
  }

  getScene() {
    return this.scene;
  }

  add(object) {
    this.scene.add(object);
  }

  remove(object) {
    this.scene.remove(object);
  }
}
