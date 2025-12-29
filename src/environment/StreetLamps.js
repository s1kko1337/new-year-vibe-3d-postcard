import * as THREE from 'three';

function createStreetLamp() {
  const group = new THREE.Group();

  const poleMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 4, 8), poleMat);
  pole.position.y = 2;
  pole.castShadow = true;
  group.add(pole);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), poleMat);
  arm.position.set(0.5, 4, 0);
  group.add(arm);

  const lampHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.3, 0.4),
    new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
  );
  lampHousing.position.set(1.1, 3.9, 0);
  group.add(lampHousing);

  const lampGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffaa })
  );
  lampGlow.position.set(1.1, 3.7, 0);
  group.add(lampGlow);

  const light = new THREE.PointLight(0xffeeaa, 0.8, 15);
  light.position.set(1.1, 3.7, 0);
  light.castShadow = true;
  light.shadow.mapSize.width = 256;
  light.shadow.mapSize.height = 256;
  group.add(light);

  return group;
}

export function createStreetLamps(scene) {
  const positions = [
    { x: -10, z: -10 },
    { x: 10, z: -10 },
    { x: -10, z: 10 },
    { x: 10, z: 15 },
    { x: -15, z: 0 },
    { x: 15, z: -5 },
    { x: 5, z: 20 },
    { x: -5, z: -15 }
  ];

  const colliders = [];

  positions.forEach(pos => {
    const lamp = createStreetLamp();
    lamp.position.set(pos.x, 0, pos.z);
    lamp.rotation.y = Math.random() * Math.PI * 2;
    scene.add(lamp);

    colliders.push({
      type: 'cylinder',
      x: pos.x,
      z: pos.z,
      radius: 0.3,
      height: 4
    });
  });

  return colliders;
}
