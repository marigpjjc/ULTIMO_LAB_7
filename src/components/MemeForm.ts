import { supabase } from "../supabase";

class MemeForm extends HTMLElement {
  private previewContainer!: HTMLElement;
  private progressContainer!: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();

    const form = this.shadowRoot?.querySelector("form") as HTMLFormElement;
    const input = this.shadowRoot?.querySelector("input[type='file']") as HTMLInputElement;
    this.previewContainer = this.shadowRoot!.querySelector("#previews")!;
    this.progressContainer = this.shadowRoot!.querySelector("#progress")!;

    input.addEventListener("change", () => this.handleFilesSelected(input.files));
    form.addEventListener("submit", (e) => this.handleSubmit(e, input));
  }

  handleFilesSelected(files: FileList | null) {
    this.previewContainer.innerHTML = "";
    if (!files) return;

    Array.from(files).forEach((file) => {
      const validTypes = ["image/gif"];
      if (
        !file.type.match("image.*") &&
        !file.type.match("video.*") &&
        !validTypes.includes(file.type)
      ) {
        alert(`Archivo no válido: ${file.name}`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`Archivo muy pesado (máx 10MB): ${file.name}`);
        return;
      }

      const previewEl = document.createElement(
        file.type.startsWith("image") ? "img" : "video"
      );
      previewEl.setAttribute("src", URL.createObjectURL(file));
      previewEl.setAttribute("alt", file.name);
      previewEl.style.maxWidth = "150px";
      previewEl.style.maxHeight = "150px";
      previewEl.style.marginRight = "10px";
      if (previewEl.tagName === "VIDEO") {
        previewEl.setAttribute("muted", "true");
        previewEl.setAttribute("autoplay", "true");
        previewEl.setAttribute("loop", "true");
      }
      this.previewContainer.appendChild(previewEl);
    });
  }

  async handleSubmit(e: Event, input: HTMLInputElement) {
    e.preventDefault();

    if (!input.files || input.files.length === 0) {
      alert("Selecciona al menos un archivo");
      return;
    }

    this.progressContainer.innerHTML = "";

    const files = Array.from(input.files);

    for (const file of files) {
      const validTypes = ["image/gif"];
      if (
        !file.type.match("image.*") &&
        !file.type.match("video.*") &&
        !validTypes.includes(file.type)
      ) {
        alert(`Archivo no válido: ${file.name}`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`Archivo muy pesado (máx 10MB): ${file.name}`);
        continue;
      }

      const fileName = `${Date.now()}_${file.name}`;

      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.gap = "10px";
      container.style.marginBottom = "8px";

      const nameLabel = document.createElement("span");
      nameLabel.textContent = file.name;
      nameLabel.style.flexShrink = "0";
      nameLabel.style.maxWidth = "150px";
      nameLabel.style.overflow = "hidden";
      nameLabel.style.textOverflow = "ellipsis";
      nameLabel.style.whiteSpace = "nowrap";

      const progressBar = document.createElement("progress");
      progressBar.max = 100;
      progressBar.value = 0;
      progressBar.style.flexGrow = "1";
      progressBar.style.height = "16px";

      container.appendChild(nameLabel);
      container.appendChild(progressBar);
      this.progressContainer.appendChild(container);

      try {
        progressBar.value = 0;
        let fakeProgress = 0;
        const fakeInterval = setInterval(() => {
          fakeProgress += 10;
          progressBar.value = Math.min(fakeProgress, 90);
          if (fakeProgress >= 90) clearInterval(fakeInterval);
        }, 200);

        const { error } = await supabase.storage
          .from("memes")
          .upload(fileName, file);

        clearInterval(fakeInterval);
        progressBar.value = 100;

        if (error) {
          console.error("Error al subir el meme:", error.message);
          alert(`Error al subir el meme ${file.name}: ${error.message}`);
        }
      } catch (error) {
        alert(`Error inesperado al subir ${file.name}`);
        console.error(error);
      }
    }

    alert("Carga finalizada");
    input.value = "";
    this.previewContainer.innerHTML = "";
    this.progressContainer.innerHTML = "";

    this.dispatchEvent(
      new CustomEvent("memes-updated", { bubbles: true, composed: true })
    );
  }

  render() {
    this.shadowRoot!.innerHTML = `
<style>
:host {
  font-family: "Inter", sans-serif;
  background-color:rgb(255, 255, 255);
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: block;
  max-width: 600px;
  margin: 0 auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input[type="file"] {
  padding: 10px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-size: 0.95rem;
}

button {
  padding: 12px;
  background-color: #ffa600;
  color: white;
  font-weight: 500;
  font-size: 18px;
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background-color: #333333;
}

#previews {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

#previews img,
#previews video {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
}

#progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

progress {
  width: 100%;
  height: 8px;
  appearance: none;
}

</style>
      <form>
        <label>Selecciona uno o más memes para subir:</label>
        <input type="file" accept="image/*,video/*" multiple />
        <div id="previews"></div>
        <div id="progress"></div>
        <button type="submit">Subir Memes</button>
      </form>
    `;
  }
}

customElements.define("meme-form", MemeForm);
