import * as THREE from 'three';
import { ChampagneBottle } from './ChampagneBottle.js';
import { Sparkler } from './Sparkler.js';
import { MiniFirework } from './MiniFirework.js';

export class ItemSystem {
  constructor(scene, itemHolder) {
    this.scene = scene;
    this.itemHolder = itemHolder;
    this.currentItemIndex = -1;
    this.items = [];
    this.placedFireworks = [];

    // Количество каждого предмета
    this.itemCounts = {
      champagne: 10,
      sparkler: 1,
      firework: 3
    };

    // Текущие экземпляры предметов
    this.champagneBottle = null;
    this.sparkler = null;
    this.miniFirework = null;

    // Callbacks
    this.onDrink = null;
    this.onItemCountChange = null;

    this.initItems();
  }

  initItems() {
    // Создаём по одному экземпляру каждого предмета
    this.champagneBottle = new ChampagneBottle();
    this.champagneBottle.setOnDrink(() => {
      // Уменьшаем количество, создаём новую бутылку
      this.itemCounts.champagne--;
      if (this.onItemCountChange) {
        this.onItemCountChange(0, this.itemCounts.champagne);
      }
      if (this.onDrink) {
        this.onDrink();
      }
      // Сбрасываем бутылку для следующего использования
      if (this.itemCounts.champagne > 0) {
        setTimeout(() => {
          this.champagneBottle.reset();
        }, 500);
      }
    });

    this.sparkler = new Sparkler();

    this.miniFirework = new MiniFirework();

    this.items = [
      this.champagneBottle,
      this.sparkler,
      this.miniFirework
    ];

    this.items.forEach(item => {
      item.mesh.visible = false;
      this.itemHolder.add(item.mesh);
    });
  }

  selectItem(index) {
    // Проверяем наличие предмета
    if (index === 0 && this.itemCounts.champagne <= 0) return;
    if (index === 1 && this.itemCounts.sparkler <= 0) return;
    if (index === 2 && this.itemCounts.firework <= 0) return;

    if (index < 0 || index >= this.items.length) {
      this.hideCurrentItem();
      this.currentItemIndex = -1;
      return;
    }

    if (this.currentItemIndex >= 0) {
      this.items[this.currentItemIndex].mesh.visible = false;
      this.items[this.currentItemIndex].deactivate();
    }

    this.currentItemIndex = index;
    const item = this.items[index];

    item.mesh.visible = true;
    item.activate();
  }

  hideCurrentItem() {
    if (this.currentItemIndex >= 0) {
      this.items[this.currentItemIndex].mesh.visible = false;
      this.items[this.currentItemIndex].deactivate();
      this.currentItemIndex = -1;
    }
  }

  useItem(playerPosition, playerRotation) {
    if (this.currentItemIndex < 0) return;

    const item = this.items[this.currentItemIndex];

    if (item.use) {
      const result = item.use(playerPosition, playerRotation);

      if (result && result.type === 'placeFirework') {
        this.placeFirework(result.position);
        this.itemCounts.firework--;
        if (this.onItemCountChange) {
          this.onItemCountChange(2, this.itemCounts.firework);
        }

        // Если фейерверки закончились, прячем предмет
        if (this.itemCounts.firework <= 0) {
          item.mesh.visible = false;
          this.currentItemIndex = -1;
        }
      }

      // Проверяем использованность бенгальского огня
      if (this.currentItemIndex === 1 && this.sparkler.isConsumed()) {
        this.itemCounts.sparkler = 0;
        if (this.onItemCountChange) {
          this.onItemCountChange(1, 0);
        }
        item.mesh.visible = false;
        this.currentItemIndex = -1;
      }
    }
  }

  placeFirework(position) {
    const firework = {
      position: position.clone(),
      mesh: this.createFireworkMesh(),
      state: 'placed',
      timer: 60,
      velocity: 0,
      fuseLight: null
    };

    // Добавляем мигающий свет фитиля
    firework.fuseLight = new THREE.PointLight(0xff6600, 0.5, 2);
    firework.fuseLight.position.set(0, 0.35, 0);
    firework.mesh.add(firework.fuseLight);

    firework.mesh.position.copy(position);
    this.scene.add(firework.mesh);
    this.placedFireworks.push(firework);

    // Запуск через 1.5 секунды
    setTimeout(() => {
      firework.state = 'launching';
      if (firework.fuseLight) {
        firework.mesh.remove(firework.fuseLight);
        firework.fuseLight.dispose();
      }
    }, 1500);
  }

  createFireworkMesh() {
    const group = new THREE.Group();

    // Основа
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8),
      new THREE.MeshLambertMaterial({ color: 0xc41e3a })
    );
    tube.position.y = 0.15;
    group.add(tube);

    // Декоративные полоски
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    for (let i = 0; i < 3; i++) {
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.062, 0.02, 8),
        stripeMat
      );
      stripe.position.y = 0.05 + i * 0.1;
      group.add(stripe);
    }

    // Фитиль
    const fuse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.08, 4),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    fuse.position.set(0, 0.34, 0);
    group.add(fuse);

    return group;
  }

  update() {
    this.items.forEach(item => {
      if (item.update) item.update();
    });

    // Обновление поставленных фейерверков
    for (let i = this.placedFireworks.length - 1; i >= 0; i--) {
      const fw = this.placedFireworks[i];

      if (fw.state === 'placed' && fw.fuseLight) {
        // Мигание фитиля
        fw.fuseLight.intensity = 0.3 + Math.random() * 0.5;
      } else if (fw.state === 'launching') {
        fw.velocity += 0.025;
        fw.mesh.position.y += fw.velocity;

        // Добавляем искры при взлёте
        if (Math.random() < 0.3) {
          this.createTrailSpark(fw.mesh.position);
        }

        if (fw.mesh.position.y > 18 + Math.random() * 5) {
          fw.state = 'exploding';
          this.createExplosion(fw.mesh.position);
          this.scene.remove(fw.mesh);
          this.placedFireworks.splice(i, 1);
        }
      }
    }
  }

  createTrailSpark(position) {
    const sparkGeo = new THREE.BufferGeometry();
    const positions = new Float32Array([position.x, position.y - 0.2, position.z]);
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.1,
      transparent: true,
      opacity: 1
    });

    const spark = new THREE.Points(sparkGeo, sparkMat);
    spark.userData = { life: 1 };
    this.scene.add(spark);

    const updateSpark = () => {
      spark.userData.life -= 0.05;
      spark.material.opacity = spark.userData.life;
      spark.position.y -= 0.05;

      if (spark.userData.life > 0) {
        requestAnimationFrame(updateSpark);
      } else {
        this.scene.remove(spark);
        sparkGeo.dispose();
        sparkMat.dispose();
      }
    };

    updateSpark();
  }

  createExplosion(position) {
    const colors = [0xff0000, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0xff8800];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 100;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.15 + Math.random() * 0.25;

      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color,
      size: 0.35,
      transparent: true,
      opacity: 1
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData = { velocities, life: 1, decay: 0.015 };
    this.scene.add(particles);

    // Вспышка света
    const flash = new THREE.PointLight(color, 3, 30);
    flash.position.copy(position);
    this.scene.add(flash);

    const updateExplosion = () => {
      const pos = particles.geometry.attributes.position.array;
      const vel = particles.userData.velocities;

      for (let i = 0; i < vel.length; i++) {
        pos[i * 3] += vel[i].x;
        pos[i * 3 + 1] += vel[i].y;
        pos[i * 3 + 2] += vel[i].z;
        vel[i].y -= 0.004; // Гравитация
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.userData.life -= particles.userData.decay;
      particles.material.opacity = particles.userData.life;
      flash.intensity = particles.userData.life * 3;

      if (particles.userData.life > 0) {
        requestAnimationFrame(updateExplosion);
      } else {
        this.scene.remove(particles);
        this.scene.remove(flash);
        particles.geometry.dispose();
        particles.material.dispose();
        flash.dispose();
      }
    };

    updateExplosion();
  }

  getCurrentItem() {
    return this.currentItemIndex >= 0 ? this.items[this.currentItemIndex] : null;
  }

  getItemCounts() {
    return this.itemCounts;
  }

  setOnDrink(callback) {
    this.onDrink = callback;
  }

  setOnItemCountChange(callback) {
    this.onItemCountChange = callback;
  }
}
