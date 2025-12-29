import * as THREE from 'three';

export class ChampagneBottle {
  constructor() {
    this.mesh = new THREE.Group();
    this.bottleGroup = new THREE.Group();
    this.cork = null;
    this.corkFlying = false;
    this.corkVelocity = new THREE.Vector3();
    this.state = 'idle'; // idle, opening, opened, drinking, empty
    this.animationProgress = 0;
    this.consumed = false;
    this.particles = [];
    this.onDrink = null; // Callback когда выпил

    this.create();
  }

  create() {
    // Основа бутылки в отдельной группе для анимации
    const bottleMat = new THREE.MeshLambertMaterial({ color: 0x0a3d0a });

    // Тело бутылки
    const bodyGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.2, 8);
    const body = new THREE.Mesh(bodyGeo, bottleMat);
    body.position.y = 0.1;
    this.bottleGroup.add(body);

    // Горлышко
    const neckGeo = new THREE.CylinderGeometry(0.018, 0.035, 0.08, 8);
    const neck = new THREE.Mesh(neckGeo, bottleMat);
    neck.position.y = 0.24;
    this.bottleGroup.add(neck);

    // Золотая фольга
    const foilGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.03, 8);
    const foilMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });
    const foil = new THREE.Mesh(foilGeo, foilMat);
    foil.position.y = 0.295;
    this.bottleGroup.add(foil);

    // Этикетка
    const labelGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.06, 8);
    const labelMat = new THREE.MeshLambertMaterial({ color: 0xf5f5dc });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.y = 0.1;
    this.bottleGroup.add(label);

    // Пробка (отдельно от бутылки для анимации)
    const corkGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.04, 6);
    const corkMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    this.cork = new THREE.Mesh(corkGeo, corkMat);
    this.cork.position.y = 0.33;
    this.bottleGroup.add(this.cork);

    this.mesh.add(this.bottleGroup);

    // Позиционирование в руке - бутылка горлышком вверх
    this.bottleGroup.rotation.x = 0.2; // Слегка наклонена от игрока
    this.mesh.position.set(0, -0.05, 0);
  }

  activate() {
    if (!this.consumed) {
      this.state = 'idle';
      this.resetPosition();
    }
  }

  deactivate() {
    this.resetPosition();
  }

  resetPosition() {
    this.bottleGroup.rotation.x = 0.2;
    this.bottleGroup.rotation.z = 0;
    this.bottleGroup.position.set(0, 0, 0);
  }

  use(playerPosition, playerRotation) {
    if (this.consumed) return null;

    if (this.state === 'idle') {
      // Начинаем открывать
      this.state = 'opening';
      this.animationProgress = 0;
      return { type: 'sound', sound: 'cork' };
    } else if (this.state === 'opened') {
      // Начинаем пить
      this.state = 'drinking';
      this.animationProgress = 0;
      return { type: 'sound', sound: 'drink' };
    }

    return null;
  }

  update() {
    if (this.state === 'opening') {
      this.animationProgress += 0.025;

      if (this.animationProgress < 0.4) {
        // Пробка качается
        this.cork.rotation.z = Math.sin(this.animationProgress * 30) * 0.15;
        this.cork.position.y = 0.33 + this.animationProgress * 0.05;
      } else if (this.animationProgress < 0.8) {
        // Пробка вылетает
        if (!this.corkFlying) {
          this.corkFlying = true;
          this.corkVelocity.set(
            (Math.random() - 0.5) * 0.08,
            0.25,
            0.15 // Летит от игрока
          );
          this.createBubbles();
        }

        this.cork.position.add(this.corkVelocity);
        this.corkVelocity.y -= 0.012;
        this.cork.rotation.x += 0.3;
        this.cork.rotation.z += 0.15;
      } else {
        this.state = 'opened';
        this.cork.visible = false;
      }
    } else if (this.state === 'drinking') {
      this.animationProgress += 0.012;

      // Анимация питья: поднимаем и наклоняем бутылку ко рту
      if (this.animationProgress < 0.3) {
        // Поднимаем бутылку вверх
        this.bottleGroup.position.y = this.animationProgress * 0.3;
        this.bottleGroup.position.z = -this.animationProgress * 0.15;
      } else if (this.animationProgress < 0.8) {
        // Наклоняем горлышком к себе (к камере/рту)
        const tiltProgress = (this.animationProgress - 0.3) / 0.5;
        this.bottleGroup.rotation.x = 0.2 - tiltProgress * 2.5; // Наклон к игроку
        this.bottleGroup.rotation.z = tiltProgress * 0.2;
        this.bottleGroup.position.y = 0.09 + tiltProgress * 0.1;
        this.bottleGroup.position.z = -0.045 - tiltProgress * 0.15;

        // Капли шампанского "льются"
        if (Math.random() < 0.15) {
          this.createDrip();
        }
      } else if (this.animationProgress >= 1) {
        // Выпито!
        this.state = 'empty';
        this.consumed = true;
        this.resetPosition();

        // Вызываем callback опьянения
        if (this.onDrink) {
          this.onDrink();
        }

        return;
      }
    }

    // Обновление частиц
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.position.add(p.userData.velocity);
      p.userData.velocity.y -= 0.002;
      p.userData.life -= 0.025;
      p.material.opacity = p.userData.life;

      if (p.userData.life <= 0) {
        this.mesh.remove(p);
        p.geometry.dispose();
        p.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  createBubbles() {
    const bubbleMat = new THREE.MeshBasicMaterial({
      color: 0xffffcc,
      transparent: true,
      opacity: 0.7
    });

    for (let i = 0; i < 20; i++) {
      const size = 0.008 + Math.random() * 0.015;
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(size, 4, 4),
        bubbleMat.clone()
      );

      bubble.position.copy(this.cork.position);
      bubble.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          0.03 + Math.random() * 0.08,
          (Math.random() - 0.5) * 0.04
        ),
        life: 1
      };

      this.bottleGroup.add(bubble);
      this.particles.push(bubble);
    }
  }

  createDrip() {
    const dripMat = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.6
    });

    const drip = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 4, 4),
      dripMat
    );

    // Капля из горлышка
    drip.position.set(0, 0.28, -0.02);
    drip.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        -0.02,
        -0.01
      ),
      life: 0.8
    };

    this.bottleGroup.add(drip);
    this.particles.push(drip);
  }

  isConsumed() {
    return this.consumed;
  }

  reset() {
    this.consumed = false;
    this.state = 'idle';
    this.animationProgress = 0;
    this.corkFlying = false;
    this.cork.visible = true;
    this.cork.position.set(0, 0.33, 0);
    this.cork.rotation.set(0, 0, 0);
    this.resetPosition();

    // Очищаем частицы
    this.particles.forEach(p => {
      this.bottleGroup.remove(p);
      p.geometry.dispose();
      p.material.dispose();
    });
    this.particles = [];
  }

  setOnDrink(callback) {
    this.onDrink = callback;
  }
}
