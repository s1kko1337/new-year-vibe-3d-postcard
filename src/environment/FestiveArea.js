import * as THREE from 'three';
import { COLORS } from '../config/colors.js';

function createTent(x, z, color, scene) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 3),
    new THREE.MeshLambertMaterial({ color: 0x8b4513 })
  );
  base.position.y = 1.25;
  base.castShadow = true;
  group.add(base);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 2, 4),
    new THREE.MeshLambertMaterial({ color })
  );
  roof.position.y = 3.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.3, 0.5),
    new THREE.MeshLambertMaterial({ color: 0xdeb887 })
  );
  counter.position.set(0, 1.5, 1.6);
  group.add(counter);

  for (let i = 0; i < 6; i++) {
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 4, 4),
      new THREE.MeshBasicMaterial({ color: COLORS.lights[i % COLORS.lights.length] })
    );
    bulb.position.set(-1.5 + i * 0.6, 2.5, 1.6);
    group.add(bulb);
  }

  group.position.set(x, 0, z);
  scene.add(group);
}

function createBench(x, z, scene) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 0.8), woodMat);
  seat.position.y = 0.6;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 0.15), woodMat);
  back.position.set(0, 1.1, -0.35);
  back.castShadow = true;
  group.add(back);

  const legGeom = new THREE.BoxGeometry(0.2, 0.6, 0.6);
  [-1.2, 1.2].forEach(xPos => {
    const leg = new THREE.Mesh(legGeom, woodMat);
    leg.position.set(xPos, 0.3, 0);
    group.add(leg);
  });

  group.position.set(x, 0, z);
  group.rotation.y = Math.atan2(x, z);
  scene.add(group);
}

function createSnowman(x, z, scene) {
  const group = new THREE.Group();
  const snowMat = new THREE.MeshLambertMaterial({ color: 0xfffafa });

  [{ r: 1, y: 1 }, { r: 0.7, y: 2.3 }, { r: 0.5, y: 3.2 }].forEach(({ r, y }) => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), snowMat);
    sphere.position.y = y;
    sphere.castShadow = true;
    group.add(sphere);
  });

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.5, 8),
    new THREE.MeshLambertMaterial({ color: 0xff6600 })
  );
  nose.position.set(0, 3.2, 0.5);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  [[-0.15, 3.35, 0.4], [0.15, 3.35, 0.4]].forEach(([ex, ey, ez]) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
    eye.position.set(ex, ey, ez);
    group.add(eye);
  });

  const hatMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16), hatMat);
  hatBrim.position.y = 3.6;
  group.add(hatBrim);

  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.5, 16), hatMat);
  hatTop.position.y = 3.9;
  group.add(hatTop);

  const scarf = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.1, 8, 16),
    new THREE.MeshLambertMaterial({ color: 0xc41e3a })
  );
  scarf.position.y = 2.8;
  scarf.rotation.x = Math.PI / 2;
  group.add(scarf);

  group.position.set(x, 0, z);
  scene.add(group);
}

function createGifts(scene) {
  const giftColors = [0xc41e3a, 0x2e5a3e, 0xffd700, 0x4169e1, 0xff69b4];

  for (let i = 0; i < 8; i++) {
    const color = giftColors[Math.floor(Math.random() * giftColors.length)];
    const size = 0.4 + Math.random() * 0.4;

    const gift = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshLambertMaterial({ color })
    );

    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    gift.position.set(Math.cos(angle) * radius, size / 2, Math.sin(angle) * radius);
    gift.rotation.y = Math.random() * Math.PI;
    gift.castShadow = true;

    const ribbonMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(size + 0.05, 0.05, size / 4), ribbonMat);
    ribbonH.position.y = size / 2 + 0.03;
    gift.add(ribbonH);

    const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(size / 4, 0.05, size + 0.05), ribbonMat);
    ribbonV.position.y = size / 2 + 0.03;
    gift.add(ribbonV);

    scene.add(gift);
  }
}

export function createFestiveArea(scene) {
  createTent(-10, 5, 0xc41e3a, scene);
  createTent(-8, -8, 0x2e5a3e, scene);
  createBench(-6, 8, scene);
  createBench(6, -6, scene);
  createSnowman(-12, 12, scene);
  createGifts(scene);
}
