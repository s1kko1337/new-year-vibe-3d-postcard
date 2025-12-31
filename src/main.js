import { SceneManager } from './core/SceneManager.js';
import { PixelRenderer } from './core/PixelRenderer.js';
import { CollisionManager } from './core/CollisionManager.js';
import { SoundManager } from './core/SoundManager.js';
import { CameraController } from './controls/CameraController.js';
import { FirstPersonController } from './controls/FirstPersonController.js';

import { createGround } from './environment/Ground.js';
import { createBuildings } from './environment/Buildings.js';
import { ChristmasTree } from './environment/Tree.js';
import { createIceRink } from './environment/IceRink.js';
import { createFestiveArea } from './environment/FestiveArea.js';
import { createStreetLamps } from './environment/StreetLamps.js';
import { Speaker } from './environment/Speaker.js';

import { Person } from './entities/Person.js';
import { Skater } from './entities/Skater.js';
import { Car } from './entities/Car.js';
import { PlayerBody } from './entities/PlayerBody.js';

import { Snow } from './effects/Snow.js';
import { Fireworks } from './effects/Fireworks.js';
import { IntoxicationEffect } from './effects/Intoxication.js';

import { ItemSystem } from './items/ItemSystem.js';

import { UIControls } from './ui/Controls.js';
import { Inventory } from './ui/Inventory.js';

import { RINK_CENTER, PEOPLE_COLORS, CAR_COLORS } from './config/constants.js';

class App {
  constructor() {
    this.sceneManager = new SceneManager();
    this.scene = this.sceneManager.getScene();

    this.collisionManager = new CollisionManager();

    this.pixelRenderer = new PixelRenderer();
    this.cameraController = new CameraController(this.pixelRenderer.getDomElement());
    this.firstPersonController = new FirstPersonController(
      this.cameraController.getPerspectiveCamera()
    );
    this.firstPersonController.setCollisionManager(this.collisionManager);
    this.firstPersonController.onDeactivate = () => {
      this.cameraController.setFirstPersonMode(false);
      if (this.ui) this.ui.setFirstPersonState(false);
      if (this.playerBody) this.playerBody.getMesh().visible = false;
      if (this.itemSystem) this.itemSystem.hideCurrentItem();
      if (this.inventory) this.inventory.hide();
      if (this.intoxication) this.intoxication.reset();
    };

    this.entities = {
      people: [],
      skaters: [],
      cars: []
    };

    this.christmasTree = null;
    this.snow = null;
    this.fireworks = null;

    this.playerBody = null;
    this.itemSystem = null;
    this.inventory = null;
    this.intoxication = null;

    this.soundManager = null;
    this.speaker = null;

    this.lastTime = performance.now();

    this.init();
  }

  init() {
    this.createEnvironment();
    this.createEntities();
    this.createEffects();
    this.createPlayer();
    this.createSoundSystem();
    this.createUI();
    this.bindItemKeys();

    this.animate();
  }

  createEnvironment() {
    createGround(this.scene);
    createBuildings(this.scene);

    this.christmasTree = new ChristmasTree();
    this.scene.add(this.christmasTree.mesh);

    createIceRink(this.scene);
    createFestiveArea(this.scene);

    const lampColliders = createStreetLamps(this.scene);
    this.collisionManager.addColliders(lampColliders);
  }

  getValidPosition() {
    let x, z;
    do {
      x = (Math.random() - 0.5) * 35;
      z = (Math.random() - 0.5) * 35;
    } while (
      Math.abs(x + 20) < 4 ||
      Math.abs(z + 20) < 4 ||
      Math.sqrt((x - RINK_CENTER.x) ** 2 + (z - RINK_CENTER.z) ** 2) < 10
    );
    return { x, z };
  }

  createEntities() {
    for (let i = 0; i < 12; i++) {
      const color = PEOPLE_COLORS[Math.floor(Math.random() * PEOPLE_COLORS.length)];
      const person = new Person(color);
      const pos = this.getValidPosition();
      person.setPosition(pos.x, pos.z);
      person.setTarget(pos.x, pos.z);
      person.onReachTarget = () => this.getValidPosition();
      this.scene.add(person.mesh);
      this.entities.people.push(person);
    }

    for (let i = 0; i < 6; i++) {
      const color = PEOPLE_COLORS[Math.floor(Math.random() * PEOPLE_COLORS.length)];
      const skater = new Skater(color, RINK_CENTER.x, RINK_CENTER.z);
      this.scene.add(skater.mesh);
      this.entities.skaters.push(skater);
    }

    for (let i = 0; i < 3; i++) {
      const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
      const car = new Car(color, 'horizontal', -30 + i * 25);
      this.scene.add(car.mesh);
      this.entities.cars.push(car);
    }

    for (let i = 0; i < 2; i++) {
      const color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
      const car = new Car(color, 'vertical', -25 + i * 30);
      this.scene.add(car.mesh);
      this.entities.cars.push(car);
    }
  }

  createEffects() {
    this.snow = new Snow(this.scene);
    this.fireworks = new Fireworks(this.scene);
    this.intoxication = new IntoxicationEffect(this.scene);

    this.intoxication.onPassedOut = () => {
      this.firstPersonController.canMove = false;
    };

    this.intoxication.onWakeUp = () => {
      this.firstPersonController.canMove = true;
    };
  }

  createPlayer() {
    const camera = this.cameraController.getPerspectiveCamera();
    this.playerBody = new PlayerBody(camera);
    this.scene.add(this.playerBody.getMesh());
    this.playerBody.getMesh().visible = false;

    this.itemSystem = new ItemSystem(this.scene, this.playerBody.getItemHolder());

    this.itemSystem.setOnDrink(() => {
      this.intoxication.drink();
    });

    this.itemSystem.setOnItemCountChange((index, count) => {
      if (this.inventory) {
        this.inventory.items[index].count = count;
        this.inventory.updateSlots();
      }
    });

    this.inventory = new Inventory();
    this.inventory.setOnSelect((index) => {
      this.itemSystem.selectItem(index);
    });
  }

  createSoundSystem() {
    const camera = this.cameraController.getPerspectiveCamera();
    this.soundManager = new SoundManager(camera);

    this.speaker = new Speaker();
    this.scene.add(this.speaker.getMesh());

    this.soundManager.loadSounds().then(() => {
      this.soundManager.setupBackgroundMusic(this.speaker);
      this.soundManager.playBackgroundMusic();
    });

    this.itemSystem.setSoundManager(this.soundManager);
    this.snow.setSoundManager(this.soundManager);
    this.fireworks.setSoundManager(this.soundManager);
    this.firstPersonController.setSoundManager(this.soundManager);
  }

  bindItemKeys() {
    document.addEventListener('keydown', (e) => {
      if (!this.firstPersonController.isActive()) return;
      if (this.intoxication && this.intoxication.isPlayerPassedOut()) return;

      if (e.code === 'Digit1') {
        this.itemSystem.selectItem(0);
        this.inventory.selectSlot(0);
      } else if (e.code === 'Digit2') {
        this.itemSystem.selectItem(1);
        this.inventory.selectSlot(1);
      } else if (e.code === 'Digit3') {
        this.itemSystem.selectItem(2);
        this.inventory.selectSlot(2);
      } else if (e.code === 'KeyQ') {
        this.itemSystem.selectItem(-1);
        this.inventory.deselectAll();
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!this.firstPersonController.isActive()) return;
      if (!document.pointerLockElement) return;
      if (this.intoxication && this.intoxication.isPlayerPassedOut()) return;

      if (e.button === 0) {
        this.itemSystem.useItem(
          this.firstPersonController.position,
          this.firstPersonController.rotation
        );
      }
    });
  }

  createUI() {
    this.ui = new UIControls({
      onStorm: () => this.snow.toggleStorm(),
      onFireworks: () => this.fireworks.toggle(),
      onFirstPerson: () => this.toggleFirstPerson()
    });
  }

  toggleFirstPerson() {
    const active = this.firstPersonController.toggle();
    this.cameraController.setFirstPersonMode(active);

    this.playerBody.getMesh().visible = active;

    if (this.soundManager) {
      this.soundManager.setFirstPersonMode(active);
    }

    if (active) {
      this.inventory.show();
    } else {
      this.inventory.hide();
      this.itemSystem.hideCurrentItem();
      this.intoxication.reset();
    }

    return active;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.entities.people.forEach(p => p.update());
    this.entities.skaters.forEach(s => s.update());
    this.entities.cars.forEach(c => c.update());

    this.christmasTree.update();
    this.snow.update();
    this.fireworks.update();

    if (this.speaker) {
      this.speaker.update();
    }

    if (this.intoxication) {
      this.intoxication.setPlayerPosition(this.firstPersonController.position);
      this.intoxication.update(deltaTime);
    }

    this.cameraController.update();

    if (this.firstPersonController.isActive() && this.intoxication) {
      const sway = this.intoxication.getCameraSway();
      this.firstPersonController.drunkSway = sway;
    } else {
      this.firstPersonController.drunkSway = { x: 0, y: 0, roll: 0 };
    }

    this.firstPersonController.update();

    if (this.firstPersonController.isActive()) {
      const keys = this.firstPersonController.keys;
      const isWalking = keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'];
      const canWalk = !this.intoxication || !this.intoxication.isPlayerPassedOut();
      this.playerBody.setWalking(isWalking && canWalk);
      this.playerBody.update();
      this.itemSystem.update();
    }

    this.pixelRenderer.render(this.scene, this.cameraController.getActiveCamera());
  }
}

new App();
