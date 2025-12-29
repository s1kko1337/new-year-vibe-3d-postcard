export class Inventory {
  constructor() {
    this.container = null;
    this.slots = [];
    this.selectedIndex = -1;
    this.visible = false;

    this.items = [
      { name: 'ШАМПАНСКОЕ', icon: '🍾', key: '1', count: 3, maxCount: 3 },
      { name: 'БЕНГАЛЬСКИЙ', icon: '✨', key: '2', count: 1, maxCount: 1 },
      { name: 'ФЕЙЕРВЕРК', icon: '🎆', key: '3', count: 3, maxCount: 3 }
    ];

    this.create();
  }

  create() {
    // Загружаем пиксельный шрифт
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    this.container = document.createElement('div');
    this.container.id = 'inventory';
    this.container.innerHTML = `
      <div class="inventory-frame">
        <div class="inventory-title">[ ИНВЕНТАРЬ ]</div>
        <div class="inventory-slots"></div>
        <div class="inventory-hint">Q - УБРАТЬ</div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #inventory {
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: none;
        z-index: 1000;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }

      #inventory.visible {
        display: block;
        animation: inventory-appear 0.2s ease-out;
      }

      @keyframes inventory-appear {
        from {
          transform: translateY(-50%) scale(0.8);
          opacity: 0;
        }
        to {
          transform: translateY(-50%) scale(1);
          opacity: 1;
        }
      }

      .inventory-frame {
        background: #1a1a2e;
        border: 4px solid #4a4a6a;
        box-shadow:
          inset 0 0 0 2px #2a2a4e,
          inset 0 0 0 4px #1a1a2e,
          8px 8px 0 rgba(0,0,0,0.5);
        padding: 16px;
        min-width: 220px;
      }

      .inventory-frame::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 4px solid #6a6a8a;
        pointer-events: none;
      }

      .inventory-title {
        font-family: 'Press Start 2P', monospace;
        color: #ffd700;
        font-size: 12px;
        text-align: center;
        margin-bottom: 16px;
        text-shadow:
          2px 2px 0 #000,
          -1px -1px 0 #000,
          1px -1px 0 #000,
          -1px 1px 0 #000;
        letter-spacing: 2px;
      }

      .inventory-slots {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .inventory-slot {
        display: flex;
        align-items: center;
        background: #2a2a4e;
        border: 3px solid #3a3a5e;
        padding: 12px;
        cursor: pointer;
        transition: all 0.1s;
        position: relative;
      }

      .inventory-slot::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0.1) 0%,
          transparent 50%,
          rgba(0,0,0,0.2) 100%
        );
        pointer-events: none;
      }

      .inventory-slot:hover {
        background: #3a3a5e;
        border-color: #5a5a7e;
      }

      .inventory-slot.selected {
        background: #3a4a3e;
        border-color: #ffd700;
        box-shadow:
          0 0 0 2px #ffaa00,
          0 0 20px rgba(255,215,0,0.3);
      }

      .inventory-slot.selected::after {
        content: '►';
        position: absolute;
        left: -20px;
        color: #ffd700;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        animation: arrow-blink 0.5s infinite;
      }

      @keyframes arrow-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      .inventory-slot.empty {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .inventory-slot.empty .slot-icon {
        filter: grayscale(100%);
      }

      .slot-icon {
        font-size: 32px;
        margin-right: 12px;
        filter: drop-shadow(2px 2px 0 #000);
        min-width: 40px;
        text-align: center;
      }

      .slot-info {
        flex: 1;
      }

      .slot-name {
        font-family: 'Press Start 2P', monospace;
        color: #fff;
        font-size: 9px;
        margin-bottom: 6px;
        text-shadow: 2px 2px 0 #000;
      }

      .slot-count {
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        display: flex;
        gap: 4px;
      }

      .count-box {
        width: 14px;
        height: 14px;
        background: #4a4a6a;
        border: 2px solid #5a5a7a;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .count-box.filled {
        background: #5aff5a;
        border-color: #3aaa3a;
        box-shadow: 0 0 6px rgba(90,255,90,0.5);
      }

      .count-box.filled::after {
        content: '';
        width: 6px;
        height: 6px;
        background: #8fff8f;
      }

      .slot-key {
        font-family: 'Press Start 2P', monospace;
        background: #1a1a2e;
        color: #ffd700;
        font-size: 12px;
        padding: 6px 10px;
        border: 3px solid #3a3a5e;
        margin-left: 8px;
        text-shadow: 1px 1px 0 #000;
      }

      .inventory-hint {
        font-family: 'Press Start 2P', monospace;
        color: #6a6a8a;
        font-size: 8px;
        text-align: center;
        margin-top: 12px;
        text-shadow: 1px 1px 0 #000;
      }
    `;
    document.head.appendChild(style);

    const slotsContainer = this.container.querySelector('.inventory-slots');

    this.items.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.index = index;

      // Создаём индикаторы количества
      let countBoxes = '';
      for (let i = 0; i < item.maxCount; i++) {
        const filled = i < item.count ? 'filled' : '';
        countBoxes += `<div class="count-box ${filled}"></div>`;
      }

      slot.innerHTML = `
        <div class="slot-icon">${item.icon}</div>
        <div class="slot-info">
          <div class="slot-name">${item.name}</div>
          <div class="slot-count">${countBoxes}</div>
        </div>
        <div class="slot-key">${item.key}</div>
      `;

      slot.addEventListener('click', () => {
        if (item.count > 0) {
          this.selectSlot(index);
          if (this.onSelect) this.onSelect(index);
        }
      });

      this.slots.push(slot);
      slotsContainer.appendChild(slot);
    });

    document.body.appendChild(this.container);
  }

  show() {
    this.visible = true;
    this.container.classList.add('visible');
  }

  hide() {
    this.visible = false;
    this.container.classList.remove('visible');
    this.selectedIndex = -1;
    this.updateSlots();
  }

  selectSlot(index) {
    this.selectedIndex = index;
    this.updateSlots();
  }

  deselectAll() {
    this.selectedIndex = -1;
    this.updateSlots();
  }

  updateSlots() {
    this.slots.forEach((slot, index) => {
      const item = this.items[index];
      slot.classList.toggle('selected', index === this.selectedIndex);
      slot.classList.toggle('empty', item.count <= 0);

      // Обновляем индикаторы количества
      const countBoxes = slot.querySelectorAll('.count-box');
      countBoxes.forEach((box, i) => {
        box.classList.toggle('filled', i < item.count);
      });
    });
  }

  useItem(index) {
    if (index >= 0 && index < this.items.length) {
      const item = this.items[index];
      if (item.count > 0) {
        item.count--;
        this.updateSlots();
        return true;
      }
    }
    return false;
  }

  resetItem(index, count = null) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].count = count !== null ? count : this.items[index].maxCount;
      this.updateSlots();
    }
  }

  getItemCount(index) {
    return index >= 0 && index < this.items.length ? this.items[index].count : 0;
  }

  setOnSelect(callback) {
    this.onSelect = callback;
  }
}
