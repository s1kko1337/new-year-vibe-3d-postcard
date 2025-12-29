import * as THREE from 'three';
import { COLORS } from '../config/colors.js';
import { RINK_CENTER, RINK_RADIUS } from '../config/constants.js';

function createLampPost() {
  const group = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 5, 8),
    new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
  );
  pole.position.y = 2.5;
  pole.castShadow = true;
  group.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffaa })
  );
  lamp.position.y = 5;
  group.add(lamp);

  const light = new THREE.PointLight(0xffffaa, 0.5, 12);
  light.position.y = 5;
  group.add(light);

  return group;
}

export function createIceRink(scene) {
  const rinkMat = new THREE.MeshLambertMaterial({
    color: COLORS.ice,
    transparent: true,
    opacity: 0.8
  });

  const rink = new THREE.Mesh(new THREE.CircleGeometry(RINK_RADIUS, 32), rinkMat);
  rink.rotation.x = -Math.PI / 2;
  rink.position.set(RINK_CENTER.x, 0.02, RINK_CENTER.z);
  rink.receiveShadow = true;
  scene.add(rink);

  const border = new THREE.Mesh(
    new THREE.TorusGeometry(RINK_RADIUS, 0.3, 8, 32),
    new THREE.MeshLambertMaterial({ color: 0x8b4513 })
  );
  border.rotation.x = -Math.PI / 2;
  border.position.set(RINK_CENTER.x, 0.3, RINK_CENTER.z);
  border.castShadow = true;
  scene.add(border);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const lampPost = createLampPost();
    lampPost.position.set(
      RINK_CENTER.x + Math.cos(angle) * 10,
      0,
      RINK_CENTER.z + Math.sin(angle) * 10
    );
    scene.add(lampPost);
  }
}
