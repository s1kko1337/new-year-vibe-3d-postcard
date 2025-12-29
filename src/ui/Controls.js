export class UIControls {
  constructor(options) {
    this.onStorm = options.onStorm;
    this.onFireworks = options.onFireworks;
    this.onFirstPerson = options.onFirstPerson;
    this.infoElement = document.getElementById('info');

    this.createUI();
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'controls';
    container.innerHTML = `
      <button id="stormBtn">Метель</button>
      <button id="fireworksBtn">Салют</button>
      <button id="fpBtn">От первого лица</button>
    `;
    document.body.appendChild(container);

    document.getElementById('stormBtn').addEventListener('click', () => {
      const active = this.onStorm();
      this.updateButton('stormBtn', active);
    });

    document.getElementById('fireworksBtn').addEventListener('click', () => {
      const active = this.onFireworks();
      this.updateButton('fireworksBtn', active);
    });

    document.getElementById('fpBtn').addEventListener('click', () => {
      const active = this.onFirstPerson();
      this.updateButton('fpBtn', active);
      this.updateInfo(active);
    });
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
      if (fpMode) {
        this.infoElement.textContent = 'WASD: движение | Пробел: прыжок | 1-3: предметы | ЛКМ: использовать | ESC: выход';
      } else {
        this.infoElement.textContent = 'ЛКМ: вращение | Колесо: zoom | ПКМ: перемещение';
      }
    }
  }

  setFirstPersonState(active) {
    this.updateButton('fpBtn', active);
    this.updateInfo(active);
  }
}
