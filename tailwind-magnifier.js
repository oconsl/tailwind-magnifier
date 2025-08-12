class TailwindMagnifier extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.tracking = false;
    this.lastEl = null;

    const container = document.createElement('div');
    container.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: sans-serif;
        }
        .tab {
          position: fixed;
          bottom: 40px;
          left: 0;
          background: #111;
          color: #fff;
          border-radius: 0 8px 8px 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          z-index: 999999;
          transform: translateX(-80%);
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          padding: 8px;
          cursor: pointer;
        }
        .tab:hover {
          transform: translateX(0);
        }
        .arrow {
          font-size: 16px;
          margin-right: 8px;
          transition: transform 0.3s;
        }
        .tab:hover .arrow {
          transform: rotate(180deg);
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .toggle input[type="checkbox"] {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #0f0;
          background: transparent;
          cursor: pointer;
          position: relative;
        }
        .toggle input[type="checkbox"]:checked {
          background: #0f0;
        }
        .popup {
          position: fixed;
          background: #000;
          color: #0f0;
          padding: 6px 10px;
          font-size: 12px;
          font-family: monospace;
          border-radius: 6px;
          pointer-events: none;
          white-space: pre-wrap;
          z-index: 999999;
          max-width: 300px;
          display: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      </style>
      <div class="tab">
        <span class="arrow">▶</span>
        <div class="toggle">
          <label>On</label>
          <input type="checkbox" />
        </div>
      </div>
      <div class="popup"></div>
    `;

    this.shadowRoot.appendChild(container);

    this.toggle = this.shadowRoot.querySelector('input');
    this.popup = this.shadowRoot.querySelector('.popup');
    this.tab = this.shadowRoot.querySelector('.tab');

    this.toggle.addEventListener('change', () => {
      this.tracking = this.toggle.checked;
      this.popup.style.display = this.tracking ? 'block' : 'none';
      if (!this.tracking && this.lastEl) {
        this.lastEl.style.outline = '';
        this.lastEl = null;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.tracking) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);

      // Evitar que el tracking afecte al propio componente
      if (!el || this.shadowRoot.contains(el)) return;

      if (el !== this.lastEl) {
        if (this.lastEl) this.lastEl.style.outline = '';
        this.lastEl = el;
        el.style.outline = '2px solid red';

        const styles = getComputedStyle(el);
        const twClasses = this.mapToTailwind(styles);
        this.popup.innerText = twClasses || '(sin clases mapeadas)';
      }

      this.popup.style.width = 'auto';
      const popupWidth = this.popup.offsetWidth;

      // Posicionamiento horizontal
      if (e.pageX + popupWidth + 20 > window.innerWidth) {
        this.popup.style.left = (e.pageX - popupWidth - 12) + 'px';
      } else {
        this.popup.style.left = (e.pageX + 12) + 'px';
      }

      // Posicionamiento vertical
      if (e.pageY + this.popup.offsetHeight + 20 > window.innerHeight) {
        this.popup.style.top = (e.pageY - this.popup.offsetHeight - 12) + 'px';
      } else {
        this.popup.style.top = (e.pageY + 12) + 'px';
      }
    });
  }

  mapToTailwind(styles) {
    const tw = [];

    // Color de fondo
    if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const color = styles.backgroundColor.match(/\d+/g)?.map(Number);
      if (color) {
        if (color[0] === 255 && color[1] === 255 && color[2] === 255) tw.push('bg-white');
        else if (color[0] === 0 && color[1] === 0 && color[2] === 0) tw.push('bg-black');
        else tw.push(`bg-[rgb(${color.join(',')})]`);
      }
    }

    // Tamaño de fuente
    if (styles.fontSize) {
      const size = parseFloat(styles.fontSize);
      if (size === 16) tw.push('text-base');
      else if (size === 14) tw.push('text-sm');
      else tw.push(`text-[${size}px]`);
    }

    // Padding
    if (styles.padding) {
      const pads = styles.padding.split(' ');
      if (pads.length === 1) tw.push(`p-[${pads[0]}]`);
      else tw.push(`pt-[${pads[0]}] pr-[${pads[1]}] pb-[${pads[2]}] pl-[${pads[3]}]`);
    }

    return tw.join(' ');
  }
}

customElements.define('tailwind-magnifier', TailwindMagnifier);
