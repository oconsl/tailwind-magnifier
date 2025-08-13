class TailwindMagnifier extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.tracking = false
    this.lastEl = null

    const container = document.createElement("div")
    container.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .tab {
          position: fixed;
          bottom: 32px;
          left: 0;
          background: linear-gradient(135deg, #f8f4ff 0%, #e8f2ff 100%);
          color: #6b46c1;
          border-radius: 0 16px 16px 0;
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(139, 92, 246, 0.1);
          z-index: 999999;
          transform: translateX(-75%);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          border: 1px solid rgba(139, 92, 246, 0.1);
          backdrop-filter: blur(12px);
          min-width: 180px;
        }
        .tab:hover {
          transform: translateX(0);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2), 0 6px 20px rgba(139, 92, 246, 0.15);
          background: linear-gradient(135deg, #faf7ff 0%, #eef2ff 100%);
        }
        .arrow {
          font-size: 14px;
          margin-right: 12px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: #a78bfa;
          font-weight: 600;
        }
        .tab:hover .arrow {
          transform: rotate(180deg);
          color: #8b5cf6;
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .toggle label {
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.5px;
          color: #6b46c1;
          user-select: none;
        }
        .toggle input[type="checkbox"] {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid #d1c4e9;
          background: #ffffff;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
        }
        .toggle input[type="checkbox"]:hover {
          border-color: #a78bfa;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }
        .toggle input[type="checkbox"]:checked {
          background: linear-gradient(135deg, #10d9c4 0%, #06b6d4 100%);
          border-color: #06b6d4;
          box-shadow: 0 4px 16px rgba(6, 182, 212, 0.3);
        }
        .toggle input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .popup {
          position: fixed;
          background: linear-gradient(135deg, #fefcff 0%, #f8fafc 100%);
          color: #475569;
          padding: 16px 20px;
          font-size: 13px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          border-radius: 12px;
          pointer-events: auto;
          cursor: pointer;
          white-space: pre-wrap;
          z-index: 999999;
          max-width: 420px;
          display: none;
          box-shadow: 
            0 20px 60px rgba(139, 92, 246, 0.15),
            0 8px 32px rgba(139, 92, 246, 0.1),
            0 0 0 1px rgba(139, 92, 246, 0.05);
          line-height: 1.5;
          border: 1px solid rgba(139, 92, 246, 0.08);
          backdrop-filter: blur(16px);
          font-weight: 500;
          letter-spacing: 0.25px;
          transition: all 0.2s ease;
        }
        .popup:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 24px 70px rgba(139, 92, 246, 0.2),
            0 12px 40px rgba(139, 92, 246, 0.15),
            0 0 0 1px rgba(139, 92, 246, 0.1);
        }
        .popup::after {
          content: '📋 Click para copiar';
          position: absolute;
          bottom: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: rgba(139, 92, 246, 0.7);
          background: rgba(255, 255, 255, 0.9);
          padding: 2px 8px;
          border-radius: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .popup:hover::after {
          opacity: 1;
        }

        /* Animación suave para el outline del elemento seleccionado */
        @keyframes pulse-outline {
          0% { box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.6); }
          50% { box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.3); }
          100% { box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.6); }
        }
      </style>
      <div class="tab">
        <span class="arrow">▶</span>
        <div class="toggle">
          <label>TW Magnifier</label>
          <input type="checkbox" />
        </div>
      </div>
      <div class="popup"></div>
    `

    this.shadowRoot.appendChild(container)

    /* ---------- referencias a los elementos internos ---------- */
    this.toggle = this.shadowRoot.querySelector("input");
    this.popup  = this.shadowRoot.querySelector(".popup");
    this.tab    = this.shadowRoot.querySelector(".tab");

    /* ----------   EVENTOS  ---------- */

    /* ---------- evento del checkbox ---------- */
    this.toggle.addEventListener("click", () => {
      this.tracking = this.toggle.checked;
      this.popup.style.display = this.tracking ? "block" : "none";
      if (!this.tracking && this.lastEl) {
        this.lastEl.style.outline = "";
        this.lastEl.style.boxShadow = "";
        this.lastEl = null;
      }
    });

    /* ---------- evento de click en el popup (copiar) ---------- */
    document.addEventListener("click", (e) => {
      if (this.shadowRoot.contains(e.target)) return;

      // 1. Evitamos que el click se propague a la página
      e.preventDefault();
      e.stopPropagation();

      const textToCopy = this.popup.innerText;
      if (!textToCopy || textToCopy === "(sin clases equivalentes)") return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        // Feedback visual breve
        const originalBg = this.popup.style.background;
        this.popup.style.background =
          "linear-gradient(135deg,#dcfce7 0%,#bbf7d0 100%)";
        this.popup.style.color = "#166534";

        setTimeout(() => {
          this.popup.style.background = originalBg;
          this.popup.style.color = "";
        }, 500);
      }).catch(() => {
        const originalBg = this.popup.style.background;
        this.popup.style.background =
          "linear-gradient(135deg,#fef2f2 0%,#fecaca 100%)";
        this.popup.style.color = "#dc2626";

        setTimeout(() => {
          this.popup.style.background = originalBg;
          this.popup.style.color = "";
        }, 500);
      });
    });

    /* ---------- evento de mousemove (tracking) ---------- */
    document.addEventListener("mousemove", (e) => {
      if (!this.tracking) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);

      // Evitar que el propio componente sea el objetivo del tracking
      if (!el || this.shadowRoot.contains(el)) return;

      if (el !== this.lastEl) {
        /* 1. Limpiar el último elemento */
        if (this.lastEl) {
          this.lastEl.style.outline = "";
          this.lastEl.style.boxShadow = "";
        }

        /* 2. Guardar el nuevo */
        this.lastEl = el;
        el.style.boxShadow =
          "0 0 0 2px rgba(236,72,153,.6), 0 8px 32px rgba(236,72,153,.15)";
        el.style.outline = "none";

        /* 3. Obtener las clases */
        const styles = getComputedStyle(el);
        const twClasses = this.mapToTailwind(styles, el);
        this.popup.innerText = twClasses || "(sin clases equivalentes)";
      }

      /* ---------- Posicionar popup ----------
         * Se hace en requestAnimationFrame para que la medida sea correcta
         * después de haber actualizado `innerText`. */
      requestAnimationFrame(() => {
        const viewportWidth  = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Ancho/alto del popup (ya con su contenido)
        const popW = this.popup.offsetWidth;
        const popH = this.popup.offsetHeight;

        /* 1. Posición horizontal */
        let left = e.clientX + 8;          // por defecto a la derecha
        if (e.clientX + 8 + popW > viewportWidth) {
          left = e.clientX - popW - 8;     // si no cabe, a la izquierda
        }
        this.popup.style.left = `${left}px`;

        /* 2. Posición vertical */
        let top = e.clientY + 8;           // por defecto debajo
        if (e.clientY + 8 + popH > viewportHeight) {
          top = e.clientY - popH - 8;      // si no cabe, encima
        }
        this.popup.style.top = `${top}px`;
      });
    });

    /* ---------- Bloquear clicks que salgan del componente ----------
       * Se añade un "overlay" transparente en el documento.
       * Cuando el modo está activo, cualquier click fuera del popup
       * se detiene y no llega al resto de la página. */
    this.overlay = document.createElement("div");
    this.overlay.style.position = "fixed";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.width = "100vw";
    this.overlay.style.height = "100vh";
    this.overlay.style.zIndex = "999998"; // justo debajo del popup
    this.overlay.style.pointerEvents = "none"; // por defecto no intercepta

    document.body.appendChild(this.overlay);

    /* Cuando activamos el modo, habilitamos la capa de bloqueo */
    this.toggle.addEventListener("change", () => {
      this.overlay.style.pointerEvents = this.tracking ? "auto" : "none";
    });

    /* Si haces click dentro del popup, lo bloquea también
       (evita que se disparen eventos de click en el resto). */
    this.popup.addEventListener("click", (e) => e.stopPropagation());
  }


  // Función helper para convertir RGB a hex
  rgbToHex(rgb) {
    const values = rgb.match(/\d+/g)
    if (!values) return null
    return "#" + values.map((x) => Number.parseInt(x).toString(16).padStart(2, "0")).join("")
  }

  // Función helper para obtener el valor más cercano de spacing
  getClosestSpacing(px) {
    const spacings = {
      0: "0",
      1: "0.25rem",
      2: "0.5rem",
      3: "0.75rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      7: "1.75rem",
      8: "2rem",
      9: "2.25rem",
      10: "2.5rem",
      11: "2.75rem",
      12: "3rem",
      14: "3.5rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      28: "7rem",
      32: "8rem",
      36: "9rem",
      40: "10rem",
      44: "11rem",
      48: "12rem",
      52: "13rem",
      56: "14rem",
      60: "15rem",
      64: "16rem",
      72: "18rem",
      80: "20rem",
      96: "24rem",
    }

    const pxValue = Number.parseFloat(px)
    const remValue = pxValue / 16 // Convertir px a rem

    let closest = null
    let minDiff = Number.POSITIVE_INFINITY

    for (const [key, value] of Object.entries(spacings)) {
      const targetRem = Number.parseFloat(value.replace("rem", "")) || 0
      const diff = Math.abs(remValue - targetRem)
      if (diff < minDiff) {
        minDiff = diff
        closest = key
      }
    }

    return closest
  }

  mapToTailwind(styles, element) {
    const tw = []

    // === LAYOUT ===

    // Display
    const display = styles.display
    if (display === "none") tw.push("hidden")
    else if (display === "flex") tw.push("flex")
    else if (display === "inline-flex") tw.push("inline-flex")
    else if (display === "grid") tw.push("grid")
    else if (display === "inline-grid") tw.push("inline-grid")
    else if (display === "block") tw.push("block")
    else if (display === "inline") tw.push("inline")
    else if (display === "inline-block") tw.push("inline-block")

    // Position
    const position = styles.position
    if (position === "static") tw.push("static")
    else if (position === "fixed") tw.push("fixed")
    else if (position === "absolute") tw.push("absolute")
    else if (position === "relative") tw.push("relative")
    else if (position === "sticky") tw.push("sticky")

    // Flexbox
    if (display === "flex" || display === "inline-flex") {
      const direction = styles.flexDirection
      if (direction === "row") tw.push("flex-row")
      else if (direction === "row-reverse") tw.push("flex-row-reverse")
      else if (direction === "column") tw.push("flex-col")
      else if (direction === "column-reverse") tw.push("flex-col-reverse")

      const wrap = styles.flexWrap
      if (wrap === "wrap") tw.push("flex-wrap")
      else if (wrap === "wrap-reverse") tw.push("flex-wrap-reverse")
      else if (wrap === "nowrap") tw.push("flex-nowrap")

      const justifyContent = styles.justifyContent
      if (justifyContent === "flex-start") tw.push("justify-start")
      else if (justifyContent === "flex-end") tw.push("justify-end")
      else if (justifyContent === "center") tw.push("justify-center")
      else if (justifyContent === "space-between") tw.push("justify-between")
      else if (justifyContent === "space-around") tw.push("justify-around")
      else if (justifyContent === "space-evenly") tw.push("justify-evenly")

      const alignItems = styles.alignItems
      if (alignItems === "flex-start") tw.push("items-start")
      else if (alignItems === "flex-end") tw.push("items-end")
      else if (alignItems === "center") tw.push("items-center")
      else if (alignItems === "baseline") tw.push("items-baseline")
      else if (alignItems === "stretch") tw.push("items-stretch")
    }

    // Grid
    if (display === "grid" || display === "inline-grid") {
      const gridCols = styles.gridTemplateColumns
      if (gridCols && gridCols !== "none") {
        const colCount = gridCols.split(" ").length
        if (colCount <= 12) tw.push(`grid-cols-${colCount}`)
        else tw.push(`grid-cols-[${gridCols}]`)
      }

      const gap = styles.gap
      if (gap && gap !== "normal") {
        const gapValue = this.getClosestSpacing(gap)
        if (gapValue !== null) tw.push(`gap-${gapValue}`)
        else tw.push(`gap-[${gap}]`)
      }
    }

    // === SPACING ===

    // Padding
    const padding = styles.padding
    if (padding && padding !== "0px") {
      const padValues = padding.split(" ")
      if (padValues.length === 1) {
        const p = this.getClosestSpacing(padValues[0])
        if (p !== null && p !== "0") tw.push(`p-${p}`)
        else if (p === "0") tw.push("p-0")
        else tw.push(`p-[${padValues[0]}]`)
      } else {
        // Padding específico por lado
        const pt = this.getClosestSpacing(styles.paddingTop)
        const pr = this.getClosestSpacing(styles.paddingRight)
        const pb = this.getClosestSpacing(styles.paddingBottom)
        const pl = this.getClosestSpacing(styles.paddingLeft)

        if (pt !== null && pt !== "0") tw.push(`pt-${pt}`)
        if (pr !== null && pr !== "0") tw.push(`pr-${pr}`)
        if (pb !== null && pb !== "0") tw.push(`pb-${pb}`)
        if (pl !== null && pl !== "0") tw.push(`pl-${pl}`)
      }
    }

    // Margin
    const margin = styles.margin
    if (margin && margin !== "0px") {
      const marginValues = margin.split(" ")
      if (marginValues.length === 1 && marginValues[0] !== "0px") {
        const m = this.getClosestSpacing(marginValues[0])
        if (m !== null && m !== "0") tw.push(`m-${m}`)
        else tw.push(`m-[${marginValues[0]}]`)
      } else {
        const mt = this.getClosestSpacing(styles.marginTop)
        const mr = this.getClosestSpacing(styles.marginRight)
        const mb = this.getClosestSpacing(styles.marginBottom)
        const ml = this.getClosestSpacing(styles.marginLeft)

        if (mt !== null && mt !== "0") tw.push(`mt-${mt}`)
        if (mr !== null && mr !== "0") tw.push(`mr-${mr}`)
        if (mb !== null && mb !== "0") tw.push(`mb-${mb}`)
        if (ml !== null && ml !== "0") tw.push(`ml-${ml}`)
      }
    }

    // === SIZING ===

    // Width
    const width = styles.width
    if (width && width !== "auto") {
      if (width === "100%") tw.push("w-full")
      else if (width.includes("vw")) tw.push(`w-[${width}]`)
      else {
        const w = this.getClosestSpacing(width)
        if (w !== null) tw.push(`w-${w}`)
        else tw.push(`w-[${width}]`)
      }
    }

    // Height
    const height = styles.height
    if (height && height !== "auto") {
      if (height === "100%") tw.push("h-full")
      else if (height === "100vh") tw.push("h-screen")
      else if (height.includes("vh")) tw.push(`h-[${height}]`)
      else {
        const h = this.getClosestSpacing(height)
        if (h !== null) tw.push(`h-${h}`)
        else tw.push(`h-[${height}]`)
      }
    }

    // === TYPOGRAPHY ===

    // Font Size
    const fontSize = styles.fontSize
    if (fontSize) {
      const size = Number.parseFloat(fontSize)
      if (size === 12) tw.push("text-xs")
      else if (size === 14) tw.push("text-sm")
      else if (size === 16) tw.push("text-base")
      else if (size === 18) tw.push("text-lg")
      else if (size === 20) tw.push("text-xl")
      else if (size === 24) tw.push("text-2xl")
      else if (size === 30) tw.push("text-3xl")
      else if (size === 36) tw.push("text-4xl")
      else if (size === 48) tw.push("text-5xl")
      else tw.push(`text-[${size}px]`)
    }

    // Font Weight
    const fontWeight = styles.fontWeight
    if (fontWeight === "100") tw.push("font-thin")
    else if (fontWeight === "200") tw.push("font-extralight")
    else if (fontWeight === "300") tw.push("font-light")
    else if (fontWeight === "400") tw.push("font-normal")
    else if (fontWeight === "500") tw.push("font-medium")
    else if (fontWeight === "600") tw.push("font-semibold")
    else if (fontWeight === "700" || fontWeight === "bold") tw.push("font-bold")
    else if (fontWeight === "800") tw.push("font-extrabold")
    else if (fontWeight === "900") tw.push("font-black")

    // Text Align
    const textAlign = styles.textAlign
    if (textAlign === "left") tw.push("text-left")
    else if (textAlign === "center") tw.push("text-center")
    else if (textAlign === "right") tw.push("text-right")
    else if (textAlign === "justify") tw.push("text-justify")

    // Line Height
    const lineHeight = styles.lineHeight
    if (lineHeight && lineHeight !== "normal") {
      const lh = Number.parseFloat(lineHeight)
      if (lh === 1) tw.push("leading-none")
      else if (lh >= 1.1 && lh <= 1.2) tw.push("leading-tight")
      else if (lh >= 1.3 && lh <= 1.4) tw.push("leading-snug")
      else if (lh >= 1.5 && lh <= 1.6) tw.push("leading-normal")
      else if (lh >= 1.7 && lh <= 1.8) tw.push("leading-relaxed")
      else if (lh >= 1.9) tw.push("leading-loose")
      else tw.push(`leading-[${lineHeight}]`)
    }

    // === COLORS ===

    // Text Color
    const color = styles.color
    if (color && color !== "rgb(0, 0, 0)" && color !== "rgba(0, 0, 0, 1)") {
      if (color === "rgb(255, 255, 255)" || color === "rgba(255, 255, 255, 1)") tw.push("text-white")
      else if (color === "rgb(0, 0, 0)" || color === "rgba(0, 0, 0, 1)") tw.push("text-black")
      else tw.push(`text-[${color}]`)
    }

    // Background Color
    const backgroundColor = styles.backgroundColor
    if (backgroundColor && backgroundColor !== "rgba(0, 0, 0, 0)" && backgroundColor !== "transparent") {
      if (backgroundColor === "rgb(255, 255, 255)" || backgroundColor === "rgba(255, 255, 255, 1)") tw.push("bg-white")
      else if (backgroundColor === "rgb(0, 0, 0)" || backgroundColor === "rgba(0, 0, 0, 1)") tw.push("bg-black")
      else if (backgroundColor === "transparent") tw.push("bg-transparent")
      else tw.push(`bg-[${backgroundColor}]`)
    }

    // === BORDERS ===

    // Border Width
    const borderWidth = styles.borderWidth
    if (borderWidth && borderWidth !== "0px") {
      const width = Number.parseFloat(borderWidth)
      if (width === 1) tw.push("border")
      else if (width === 2) tw.push("border-2")
      else if (width === 4) tw.push("border-4")
      else if (width === 8) tw.push("border-8")
      else tw.push(`border-[${width}px]`)
    }

    // Border Radius
    const borderRadius = styles.borderRadius
    if (borderRadius && borderRadius !== "0px") {
      const radius = Number.parseFloat(borderRadius)
      if (radius === 2) tw.push("rounded-sm")
      else if (radius === 4) tw.push("rounded")
      else if (radius === 6) tw.push("rounded-md")
      else if (radius === 8) tw.push("rounded-lg")
      else if (radius === 12) tw.push("rounded-xl")
      else if (radius === 16) tw.push("rounded-2xl")
      else if (radius === 24) tw.push("rounded-3xl")
      else if (radius >= 9999) tw.push("rounded-full")
      else tw.push(`rounded-[${radius}px]`)
    }

    // Border Color
    const borderColor = styles.borderColor
    if (borderColor && borderColor !== "rgb(0, 0, 0)") {
      if (borderColor === "rgb(255, 255, 255)") tw.push("border-white")
      else if (borderColor === "rgb(0, 0, 0)") tw.push("border-black")
      else tw.push(`border-[${borderColor}]`)
    }

    // === EFFECTS ===

    // Box Shadow
    const boxShadow = styles.boxShadow
    if (boxShadow && boxShadow !== "none") {
      if (boxShadow.includes("0 1px 3px")) tw.push("shadow-sm")
      else if (boxShadow.includes("0 4px 6px")) tw.push("shadow")
      else if (boxShadow.includes("0 10px 15px")) tw.push("shadow-lg")
      else if (boxShadow.includes("0 20px 25px")) tw.push("shadow-xl")
      else if (boxShadow.includes("0 25px 50px")) tw.push("shadow-2xl")
      else tw.push(`shadow-[${boxShadow}]`)
    }

    // Opacity
    const opacity = styles.opacity
    if (opacity && opacity !== "1") {
      const op = Number.parseFloat(opacity)
      if (op === 0) tw.push("opacity-0")
      else if (op === 0.05) tw.push("opacity-5")
      else if (op === 0.1) tw.push("opacity-10")
      else if (op === 0.25) tw.push("opacity-25")
      else if (op === 0.5) tw.push("opacity-50")
      else if (op === 0.75) tw.push("opacity-75")
      else if (op === 0.9) tw.push("opacity-90")
      else if (op === 0.95) tw.push("opacity-95")
      else tw.push(`opacity-[${op}]`)
    }

    // Transform
    const transform = styles.transform
    if (transform && transform !== "none") {
      if (transform.includes("rotate")) tw.push("transform rotate-*")
      if (transform.includes("scale")) tw.push("transform scale-*")
      if (transform.includes("translate")) tw.push("transform translate-*")
    }

    // Overflow
    const overflow = styles.overflow
    if (overflow === "hidden") tw.push("overflow-hidden")
    else if (overflow === "auto") tw.push("overflow-auto")
    else if (overflow === "scroll") tw.push("overflow-scroll")
    else if (overflow === "visible") tw.push("overflow-visible")

    // Z-index
    const zIndex = styles.zIndex
    if (zIndex && zIndex !== "auto" && zIndex !== "0") {
      const z = Number.parseInt(zIndex)
      if (z === 10) tw.push("z-10")
      else if (z === 20) tw.push("z-20")
      else if (z === 30) tw.push("z-30")
      else if (z === 40) tw.push("z-40")
      else if (z === 50) tw.push("z-50")
      else tw.push(`z-[${z}]`)
    }

    // Cursor
    const cursor = styles.cursor
    if (cursor === "pointer") tw.push("cursor-pointer")
    else if (cursor === "not-allowed") tw.push("cursor-not-allowed")
    else if (cursor === "wait") tw.push("cursor-wait")
    else if (cursor === "text") tw.push("cursor-text")
    else if (cursor === "move") tw.push("cursor-move")
    else if (cursor === "help") tw.push("cursor-help")

    return tw.length > 0 ? tw.join("\n") : "(sin clases equivalentes)"
  }
}
customElements.define("tailwind-magnifier", TailwindMagnifier);
