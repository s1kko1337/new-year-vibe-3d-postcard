export class UIControls {
  constructor(options) {
    this.onStorm = options.onStorm;
    this.onFireworks = options.onFireworks;
    this.onFirstPerson = options.onFirstPerson;
    this.infoElement = document.getElementById('info');
    this.isMobile = this.detectMobile();

    this.createUI();
    this.updateInfo(false);
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
           ('ontouchstart' in window);
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'controls';

    if (this.isMobile) {
      container.innerHTML = `
        <button id="stormBtn">Метель</button>
        <button id="fireworksBtn">Салют</button>
      `;
    } else {
      container.innerHTML = `
        <button id="stormBtn">Метель</button>
        <button id="fireworksBtn">Салют</button>
        <button id="fpBtn">От первого лица</button>
      `;
    }

    document.body.appendChild(container);

    document.getElementById('stormBtn').addEventListener('click', () => {
      const active = this.onStorm();
      this.updateButton('stormBtn', active);
    });

    document.getElementById('fireworksBtn').addEventListener('click', () => {
      const active = this.onFireworks();
      this.updateButton('fireworksBtn', active);
    });

    if (!this.isMobile) {
      document.getElementById('fpBtn').addEventListener('click', () => {
        const active = this.onFirstPerson();
        this.updateButton('fpBtn', active);
        this.updateInfo(active);
      });
    }
  }

  updateButton(id, active) {
    const btn = document.getElementById(id);
    if (active) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  updateInfo(fpMode) {
    if (this.infoElement) {
      if (this.isMobile) {
        this.infoElement.textContent = 'Палец: вращение | Щипок: zoom';
      } else if (fpMode) {
        this.infoElement.textContent = 'WASD: движение | Пробел: прыжок | 1-3: предметы | ЛКМ: использовать | ESC: выход';
      } else {
        this.infoElement.textContent = 'ЛКМ: вращение | Колесо: zoom | ПКМ: перемещение';
      }
    }
  }

  setFirstPersonState(active) {
    if (!this.isMobile) {
      this.updateButton('fpBtn', active);
    }
    this.updateInfo(active);
  }
}
