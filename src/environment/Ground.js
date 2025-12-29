import * as THREE from 'three';
import { COLORS } from '../config/colors.js';
import { YARD_SIZE } from '../config/constants.js';

export function createGround(scene) {
  const groundGeometry = new THREE.PlaneGeometry(YARD_SIZE, YARD_SIZE);
  const groundMaterial = new THREE.MeshLambertMaterial({ color: COLORS.snow });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMaterial = new THREE.MeshLambertMaterial({ color: COLORS.road });

  const road1 = new THREE.Mesh(new THREE.PlaneGeometry(YARD_SIZE, 6), roadMaterial);
  road1.rotation.x = -Math.PI / 2;
  road1.position.set(0, 0.01, -20);
  road1.receiveShadow = true;
  scene.add(road1);

  const road2 = new THREE.Mesh(new THREE.PlaneGeometry(6, YARD_SIZE), roadMaterial);
  road2.rotation.x = -Math.PI / 2;
  road2.position.set(-20, 0.01, 0);
  road2.receiveShadow = true;
  scene.add(road2);
}
