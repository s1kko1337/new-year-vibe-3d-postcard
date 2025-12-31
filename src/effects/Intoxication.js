import * as THREE from 'three';

export class IntoxicationEffect {
  constructor(scene) {
    this.scene = scene;
    this.drunkLevel = 0;
    this.effectTimer = 0;
    this.swayPhase = 0;
    this.drunkMeter = null;
    this.isPassedOut = false;
    this.passedOutTimer = 0;
    this.passedOutProgress = 0;

    this.hallucinations = [];
    this.squirrels = [];
    this.stars3D = [];
    this.floatingBottles = [];

    this.onPassedOut = null;
    this.onWakeUp = null;

    this.playerPosition = new THREE.Vector3();

    this.createUI();
  }

  createUI() {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    this.bubblesContainer = document.createElement('div');
    this.bubblesContainer.id = 'drunk-bubbles';

    this.drunkMeter = document.createElement('div');
    this.drunkMeter.id = 'drunk-meter';
    this.drunkMeter.innerHTML = `
      <div class="meter-label">ОПЬЯНЕНИЕ</div>
      <div class="meter-bar">
        <div class="meter-fill"></div>
        <div class="meter-segments">
          <div class="segment"></div>
          <div class="segment"></div>
          <div class="segment"></div>
          <div class="segment"></div>
          <div class="segment"></div>
        </div>
      </div>
    `;

    this.vignetteOverlay = document.createElement('div');
    this.vignetteOverlay.id = 'vignette-overlay';

    this.passedOutUI = document.createElement('div');
    this.passedOutUI.id = 'passed-out-ui';
    this.passedOutUI.innerHTML = `
      <div class="passed-text">В ОТКЛЮЧКЕ</div>
      <div class="passed-timer" id="passout-timer">10</div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #drunk-bubbles {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 501;
        overflow: hidden;
        image-rendering: pixelated;
      }

      .drunk-bubble {
        position: absolute;
        bottom: -60px;
        background: #ffee88;
        border: 4px solid #ffcc44;
        animation: pixel-bubble-rise linear forwards;
      }

      .drunk-bubble::before {
        content: '';
        position: absolute;
        top: 4px;
        left: 4px;
        width: 8px;
        height: 8px;
        background: #ffffcc;
      }

      @keyframes pixel-bubble-rise {
        0% { transform: translateY(0); opacity: 0.9; }
        100% { transform: translateY(-120vh); opacity: 0; }
      }

      #drunk-meter {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 502;
        display: none;
        image-rendering: pixelated;
      }

      #drunk-meter.visible {
        display: block;
        animation: meter-appear 0.3s ease-out;
      }

      @keyframes meter-appear {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      .meter-label {
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        color: #ffcc00;
        text-align: center;
        margin-bottom: 8px;
        text-shadow: 2px 2px 0 #000;
      }

      .meter-bar {
        width: 150px;
        height: 24px;
        background: #1a1a2e;
        border: 4px solid #4a4a6a;
        position: relative;
        box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
      }

      .meter-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 0%;
        transition: width 0.3s, background 0.3s;
      }

      .meter-fill.level-1 { width: 20%; background: #88ff88; }
      .meter-fill.level-2 { width: 40%; background: #ffff44; }
      .meter-fill.level-3 { width: 60%; background: #ffaa00; }
      .meter-fill.level-4 { width: 80%; background: #ff6600; }
      .meter-fill.level-5 { width: 100%; background: #ff0000; animation: danger-pulse 0.3s infinite; }

      @keyframes danger-pulse {
        0%, 100% { background: #ff0000; }
        50% { background: #ff6666; }
      }

      .meter-segments {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        display: flex;
      }

      .meter-segments .segment {
        flex: 1;
        border-right: 2px solid #2a2a4e;
      }

      .meter-segments .segment:last-child {
        border-right: none;
      }

      #vignette-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 500;
        opacity: 0;
        transition: opacity 0.5s;
        background: radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.8) 100%);
      }

      #vignette-overlay.active {
        opacity: 1;
      }

      #passed-out-ui {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 600;
        text-align: center;
        display: none;
        pointer-events: none;
      }

      #passed-out-ui.visible {
        display: block;
      }

      .passed-text {
        font-family: 'Press Start 2P', monospace;
        font-size: 24px;
        color: #ff4444;
        text-shadow: 4px 4px 0 #000, -2px -2px 0 #880000;
        animation: passed-pulse 0.5s ease-in-out infinite;
        margin-bottom: 20px;
      }

      @keyframes passed-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }

      .passed-timer {
        font-family: 'Press Start 2P', monospace;
        font-size: 48px;
        color: #ffffff;
        text-shadow: 4px 4px 0 #000;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(this.bubblesContainer);
    document.body.appendChild(this.drunkMeter);
    document.body.appendChild(this.vignetteOverlay);
    document.body.appendChild(this.passedOutUI);
  }

  setPlayerPosition(pos) {
    this.playerPosition.copy(pos);
  }

  drink() {
    this.drunkLevel = Math.min(5, this.drunkLevel + 1);
    this.effectTimer = 10000;
    this.updateMeter();

    if (this.drunkLevel >= 5) {
      this.passOut();
    }
  }

  passOut() {
    this.isPassedOut = true;
    this.passedOutTimer = 10000;
    this.passedOutProgress = 0;
    this.drunkMeter.classList.remove('visible');
    this.vignetteOverlay.classList.add('active');
    this.passedOutUI.classList.add('visible');

    this.spawn3DHallucinations();

    if (this.onPassedOut) this.onPassedOut();
  }

  spawn3DHallucinations() {
    const pos = this.playerPosition;

    for (let i = 0; i < 5; i++) {
      const squirrel = this.createSquirrel();
      const angle = (i / 5) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 1.5;
      squirrel.position.set(
        pos.x + Math.cos(angle) * radius,
        4 + Math.random() * 2,
        pos.z + Math.sin(angle) * radius
      );
      squirrel.rotation.x = Math.PI / 2;
      squirrel.userData = {
        angle: angle,
        radius: radius,
        speed: 0.03 + Math.random() * 0.02,
        jumpPhase: Math.random() * Math.PI * 2,
        baseY: 4 + Math.random() * 2
      };
      this.scene.add(squirrel);
      this.squirrels.push(squirrel);
    }

    for (let i = 0; i < 8; i++) {
      const star = this.createStar();
      const angle = (i / 8) * Math.PI * 2;
      star.position.set(
        pos.x + Math.cos(angle) * 2,
        6 + Math.random() * 2,
        pos.z + Math.sin(angle) * 2
      );
      star.userData = {
        angle: angle,
        orbitSpeed: 0.03 + Math.random() * 0.02,
        spinSpeed: 0.1 + Math.random() * 0.1,
        baseY: star.position.y
      };
      this.scene.add(star);
      this.stars3D.push(star);
    }

    for (let i = 0; i < 4; i++) {
      const bottle = this.createFloatingBottle();
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      bottle.position.set(
        pos.x + Math.cos(angle) * 2.5,
        5 + Math.random() * 2,
        pos.z + Math.sin(angle) * 2.5
      );
      bottle.userData = {
        angle: angle,
        floatPhase: Math.random() * Math.PI * 2,
        spinSpeed: 0.02 + Math.random() * 0.03,
        baseY: bottle.position.y
      };
      this.scene.add(bottle);
      this.floatingBottles.push(bottle);
    }
  }

  createSquirrel() {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.25, 0.4),
      bodyMat
    );
    body.position.y = 0.15;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      bodyMat
    );
    head.position.set(0, 0.3, 0.25);
    group.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), eyeMat);
    eyeL.position.set(-0.06, 0.35, 0.35);
    group.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.06;
    group.add(eyeR);

    const tailMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.5, 0.15),
      tailMat
    );
    tail.position.set(0, 0.35, -0.25);
    tail.rotation.x = -0.5;
    group.add(tail);

    const earMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.05), earMat);
    earL.position.set(-0.08, 0.45, 0.2);
    group.add(earL);
    const earR = earL.clone();
    earR.position.x = 0.08;
    group.add(earR);

    return group;
  }

  createStar() {
    const group = new THREE.Group();

    const starMat = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5
    });

    const center = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), starMat);
    group.add(center);

    const rayGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const positions = [
      [0.2, 0, 0], [-0.2, 0, 0],
      [0, 0.2, 0], [0, -0.2, 0],
      [0.15, 0.15, 0], [-0.15, 0.15, 0],
      [0.15, -0.15, 0], [-0.15, -0.15, 0]
    ];

    positions.forEach(pos => {
      const ray = new THREE.Mesh(rayGeo, starMat);
      ray.position.set(pos[0], pos[1], pos[2]);
      group.add(ray);
    });

    const light = new THREE.PointLight(0xffff00, 0.5, 2);
    group.add(light);

    return group;
  }

  createFloatingBottle() {
    const group = new THREE.Group();

    const bottleMat = new THREE.MeshLambertMaterial({ color: 0x0a5a0a });
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x2a8a2a,
      transparent: true,
      opacity: 0.7
    });

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.35, 0.15),
      glassMat
    );
    body.position.y = 0.175;
    group.add(body);

    const neck = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.08),
      glassMat
    );
    neck.position.y = 0.425;
    group.add(neck);

    const cork = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.06),
      new THREE.MeshLambertMaterial({ color: 0x8B4513 })
    );
    cork.position.y = 0.54;
    group.add(cork);

    const label = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.1, 0.16),
      new THREE.MeshLambertMaterial({ color: 0xffffcc })
    );
    label.position.y = 0.15;
    group.add(label);

    return group;
  }

  remove3DHallucinations() {
    this.squirrels.forEach(s => {
      this.scene.remove(s);
      s.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    this.squirrels = [];

    this.stars3D.forEach(s => {
      this.scene.remove(s);
      s.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
        if (child.dispose) child.dispose();
      });
    });
    this.stars3D = [];

    this.floatingBottles.forEach(b => {
      this.scene.remove(b);
      b.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    this.floatingBottles = [];
  }

  wakeUp() {
    this.isPassedOut = false;
    this.drunkLevel = 2;
    this.effectTimer = 5000;
    this.passedOutProgress = 0;
    this.vignetteOverlay.classList.remove('active');
    this.passedOutUI.classList.remove('visible');
    this.updateMeter();

    this.remove3DHallucinations();

    if (this.onWakeUp) this.onWakeUp();
  }

  updateMeter() {
    const fill = this.drunkMeter.querySelector('.meter-fill');
    fill.className = 'meter-fill';

    if (this.drunkLevel > 0) {
      this.drunkMeter.classList.add('visible');
      fill.classList.add(`level-${this.drunkLevel}`);
    } else {
      this.drunkMeter.classList.remove('visible');
    }
  }

  spawnBubble() {
    if (this.drunkLevel === 0) return;

    const bubble = document.createElement('div');
    bubble.className = 'drunk-bubble';

    const sizes = [16, 24, 32, 40];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left = Math.random() * 100 + '%';

    const duration = 4 + Math.random() * 3 - this.drunkLevel * 0.3;
    bubble.style.animationDuration = Math.max(2, duration) + 's';

    this.bubblesContainer.appendChild(bubble);

    setTimeout(() => bubble.remove(), duration * 1000);
  }

  getCameraSway() {
    if (this.drunkLevel === 0) {
      return { x: 0, y: 0, roll: 0 };
    }

    if (this.isPassedOut) {
      this.passedOutProgress = Math.min(1, this.passedOutProgress + 0.02);
      const fallAngle = this.passedOutProgress * (Math.PI / 2 - 0.2);

      return {
        x: fallAngle,
        y: Math.sin(this.swayPhase * 0.5) * 0.05,
        roll: Math.sin(this.swayPhase * 0.3) * 0.1,
        absolute: true
      };
    }

    this.swayPhase += 0.03 * this.drunkLevel;
    const intensity = this.drunkLevel * 0.004;

    return {
      x: Math.sin(this.swayPhase * 1.3) * intensity,
      y: Math.cos(this.swayPhase * 0.9) * intensity * 0.5,
      roll: Math.sin(this.swayPhase * 0.7) * intensity * 0.4
    };
  }

  update(deltaTime = 16) {
    this.swayPhase += 0.02;

    if (this.isPassedOut) {
      this.passedOutTimer -= deltaTime;

      const timerEl = document.getElementById('passout-timer');
      if (timerEl) {
        timerEl.textContent = Math.max(0, Math.ceil(this.passedOutTimer / 1000));
      }

      this.update3DHallucinations(deltaTime);

      if (this.passedOutTimer <= 0) {
        this.wakeUp();
      }
      return;
    }

    if (this.effectTimer > 0) {
      this.effectTimer -= deltaTime;

      if (Math.random() < 0.03 * this.drunkLevel) {
        this.spawnBubble();
      }

      if (this.effectTimer <= 0) {
        this.drunkLevel = Math.max(0, this.drunkLevel - 1);
        if (this.drunkLevel > 0) {
          this.effectTimer = 10000;
        }
        this.updateMeter();
      }
    }
  }

  update3DHallucinations(deltaTime) {
    const pos = this.playerPosition;
    const time = performance.now() * 0.001;

    this.squirrels.forEach(squirrel => {
      const ud = squirrel.userData;
      ud.angle += ud.speed;
      ud.jumpPhase += 0.12;

      squirrel.position.x = pos.x + Math.cos(ud.angle) * ud.radius;
      squirrel.position.z = pos.z + Math.sin(ud.angle) * ud.radius;
      squirrel.position.y = ud.baseY + Math.abs(Math.sin(ud.jumpPhase)) * 1.5;

      squirrel.rotation.x = Math.PI / 2 + Math.sin(ud.jumpPhase) * 0.2;
      squirrel.rotation.y = ud.angle + Math.PI;
    });

    this.stars3D.forEach(star => {
      const ud = star.userData;
      ud.angle += ud.orbitSpeed;

      star.position.x = pos.x + Math.cos(ud.angle) * 2;
      star.position.z = pos.z + Math.sin(ud.angle) * 2;
      star.position.y = ud.baseY + Math.sin(time * 2 + ud.angle) * 0.5;

      star.rotation.y += ud.spinSpeed;
      star.rotation.z += ud.spinSpeed * 0.5;
    });

    this.floatingBottles.forEach(bottle => {
      const ud = bottle.userData;
      ud.floatPhase += 0.03;
      ud.angle += 0.008;

      bottle.position.x = pos.x + Math.cos(ud.angle) * 2.5;
      bottle.position.z = pos.z + Math.sin(ud.angle) * 2.5;
      bottle.position.y = ud.baseY + Math.sin(ud.floatPhase) * 0.5;

      bottle.rotation.y += ud.spinSpeed;
      bottle.rotation.x = Math.sin(ud.floatPhase * 0.7) * 0.3;
    });
  }

  getDrunkLevel() {
    return this.drunkLevel;
  }

  isPlayerPassedOut() {
    return this.isPassedOut;
  }

  reset() {
    this.drunkLevel = 0;
    this.effectTimer = 0;
    this.isPassedOut = false;
    this.passedOutProgress = 0;
    this.vignetteOverlay.classList.remove('active');
    this.passedOutUI.classList.remove('visible');
    this.drunkMeter.classList.remove('visible');

    this.remove3DHallucinations();
    this.bubblesContainer.innerHTML = '';
  }
}
