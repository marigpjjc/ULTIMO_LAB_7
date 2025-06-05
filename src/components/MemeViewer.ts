class MemeViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ["src", "type"];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const src = this.getAttribute("src");
    const type = this.getAttribute("type");

    if (!src) {
      this.shadowRoot!.innerHTML = "";
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    this.shadowRoot!.innerHTML = `
<style>
:host {
  display: block;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.overlay img,
.overlay video {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

</style>
      <div class="overlay" id="overlay">
        ${
          type === "video"
            ? `<video src="${src}" controls autoplay muted></video>`
            : `<img src="${src}" alt="Ampliado" />`
        }
      </div>
    `;

    this.shadowRoot!.querySelector("#overlay")!.addEventListener("click", () => {
      this.setAttribute("src", "");
      this.setAttribute("style", "display:none;");
      document.body.style.overflow = "";
    });
  }
}

customElements.define("meme-viewer", MemeViewer);
