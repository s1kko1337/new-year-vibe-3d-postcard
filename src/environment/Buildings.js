import * as THREE from 'three';
import { COLORS } from '../config/colors.js';
import { BUILDINGS } from '../config/constants.js';

function createBuilding(config, materials) {
  const group = new THREE.Group();
  const { mainMat, roofMat, winOnMat, winOffMat } = materials;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(config.width, config.height, config.depth),
    mainMat
  );
  body.position.y = config.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(config.width + 0.5, 0.5, config.depth + 0.5),
    roofMat
  );
  roof.position.y = config.height + 0.25;
  roof.castShadow = true;
  group.add(roof);

  const windowSize = 1.2;
  const windowGap = 2.5;
  const floorHeight = config.height / config.floors;

  for (let floor = 0; floor < config.floors; floor++) {
    const y = floorHeight * (floor + 0.5);
    const windowsPerRow = Math.floor((config.width - 2) / windowGap);

    for (let w = 0; w < windowsPerRow; w++) {
      const x = -config.width / 2 + 1.5 + w * windowGap;
      const isLit = Math.random() > 0.4;

      const winFront = new THREE.Mesh(
        new THREE.PlaneGeometry(windowSize, windowSize * 1.3),
        isLit ? winOnMat : winOffMat
      );
      winFront.position.set(x, y, config.depth / 2 + 0.01);
      group.add(winFront);

      const winBack = new THREE.Mesh(
        new THREE.PlaneGeometry(windowSize, windowSize * 1.3),
        Math.random() > 0.4 ? winOnMat : winOffMat
      );
      winBack.position.set(x, y, -config.depth / 2 - 0.01);
      winBack.rotation.y = Math.PI;
      group.add(winBack);
    }
  }

  const sideWindowsPerRow = Math.floor((config.depth - 2) / windowGap);
  for (let floor = 0; floor < config.floors; floor++) {
    const y = floorHeight * (floor + 0.5);

    for (let w = 0; w < sideWindowsPerRow; w++) {
      const z = -config.depth / 2 + 1.5 + w * windowGap;

      const winLeft = new THREE.Mesh(
        new THREE.PlaneGeometry(windowSize, windowSize * 1.3),
        Math.random() > 0.4 ? winOnMat : winOffMat
      );
      winLeft.position.set(-config.width / 2 - 0.01, y, z);
      winLeft.rotation.y = -Math.PI / 2;
      group.add(winLeft);

      const winRight = new THREE.Mesh(
        new THREE.PlaneGeometry(windowSize, windowSize * 1.3),
        Math.random() > 0.4 ? winOnMat : winOffMat
      );
      winRight.position.set(config.width / 2 + 0.01, y, z);
      winRight.rotation.y = Math.PI / 2;
      group.add(winRight);
    }
  }

  const doorMat = new THREE.MeshLambertMaterial({ color: 0x4a4a5a });
  const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.3), doorMat);
  door.position.set(0, 1.5, config.depth / 2 + 0.15);
  group.add(door);

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 1.5), roofMat);
  canopy.position.set(0, 3.2, config.depth / 2 + 0.75);
  group.add(canopy);

  group.position.set(config.x, 0, config.z);
  return group;
}

export function createBuildings(scene) {
  const materials = {
    mainMat: new THREE.MeshLambertMaterial({ color: COLORS.buildingLight }),
    roofMat: new THREE.MeshLambertMaterial({ color: COLORS.buildingAccent }),
    winOnMat: new THREE.MeshBasicMaterial({ color: COLORS.window }),
    winOffMat: new THREE.MeshBasicMaterial({ color: COLORS.windowOff })
  };

  BUILDINGS.forEach(config => {
    scene.add(createBuilding(config, materials));
  });
}
