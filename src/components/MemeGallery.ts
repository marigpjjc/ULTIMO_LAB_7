import { supabase } from "../supabase";
import "./MemeViewer";

class MemeGallery extends HTMLElement {
  order: "date" | "random" = "date";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    window.addEventListener("memes-updated", () => this.loadMemes());
  }

  connectedCallback() {
    this.loadMemes();
  }

  async loadMemes() {
    this.renderLoader();

    const { data, error } = await supabase.storage.from("memes").list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      this.shadowRoot!.innerHTML = `<p>Error al cargar memes: ${error.message}</p>`;
      return;
    }

    let files = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from("memes")
          .getPublicUrl(file.name);
        return {
          name: file.name,
          url: urlData.publicUrl,
          isVideo: file.name.match(/\.(mp4|webm|ogg)$/i) !== null,
        };
      })
    );

    if (this.order === "random") {
      files = files.sort(() => Math.random() - 0.5);
    }

    this.renderGallery(files);
  }

  renderLoader() {
    this.shadowRoot!.innerHTML = `<p>Cargando memes...</p>`;
  }

  renderGallery(files: { name: string; url: string; isVideo: boolean }[]) {
    this.shadowRoot!.innerHTML = `
<style>
  :host {
    display: block;
    padding: 2rem;
    background-color:rgb(255, 255, 255);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
  }

  .controls {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .controls label {
    font-weight: 600;
    margin-right: 0.75rem;
    font-size: 1rem;
    user-select: none;
  }

select#orderSelect {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: white;
  border: 2px solid #ffa600;
  border-radius: 8px;
  padding: 0.4rem 1.2rem 0.4rem 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffa600;
  cursor: pointer;
  position: relative;
  transition: border-color 0.3s ease, color 0.3s ease;
  text-align: center;           
  text-align-last: center;    
  display: flex;
  align-items: center;       
  justify-content: center;      
  height: 40px;                
}


  select#orderSelect:hover, select#orderSelect:focus {
    border-color: #005a9e;
    color: #005a9e;
    outline: none;
  }

  .gallery {
    column-count: 5;
    column-gap: 1rem;
  }

  .item {
    break-inside: avoid;
    margin-bottom: 1rem;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    transition: transform 0.2s ease, box-shadow 0.3s ease;
    background: white;
  }

  .item:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  }

  .item img,
  .item video {
    width: 100%;
    height: auto;
    object-fit: cover;
    display: block;
    border-radius: 12px;
  }
</style>
      <div class="controls">
        <label>
          <select id="orderSelect">
            <option value="date">Fecha de publicacion</option>
            <option value="random">Memes Aleatorios</option>
          </select>
        </label>
      </div>
      <div class="gallery">
        ${files
          .map((file) =>
            file.isVideo
              ? `<div class="item" data-url="${file.url}" data-type="video">
                  <video src="${file.url}" autoplay muted loop></video>
                </div>`
              : `<div class="item" data-url="${file.url}" data-type="image">
                  <img src="${file.url}" alt="Meme" loading="lazy"/>
                </div>`
          )
          .join("")}
      </div>
      <meme-viewer style="display:none;"></meme-viewer>
    `;

    this.setupClickEvents();
    this.setupOrderChange();
  }

  setupClickEvents() {
    const viewer = this.shadowRoot!.querySelector("meme-viewer") as HTMLElement;
    const items = this.shadowRoot!.querySelectorAll(".item");

    items.forEach((item) => {
      item.addEventListener("click", () => {
        const url = item.getAttribute("data-url") || "";
        const type = item.getAttribute("data-type") || "";

        if (!url) return;

        viewer.setAttribute("src", url);
        viewer.setAttribute("type", type);
        viewer.style.display = "block";
      });
    });
  }

  setupOrderChange() {
    const select = this.shadowRoot!.querySelector("#orderSelect") as HTMLSelectElement;
    select.value = this.order;

    select.addEventListener("change", () => {
      this.order = select.value as "date" | "random";
      this.loadMemes();
    });
  }
}

customElements.define("meme-gallery", MemeGallery);
