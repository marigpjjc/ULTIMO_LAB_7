class AppRoot extends HTMLElement {
  constructor() {
    super();
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
<style>
  :host {
    display: block;
    font-family: 'Inter', sans-serif;
    background: linear-gradient(to bottom,rgb(255, 255, 255),rgb(255, 255, 255));
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  header {
    text-align: center;
    padding: 2rem 1rem;
    border-radius: 16px;
    background:rgb(0, 26, 80);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    animation: fadeIn 0.8s ease forwards;
  }

  header h1 {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(90deg,rgb(4, 255, 0),rgb(251, 255, 0),rgb(255, 123, 0),rgb(255, 68, 224),rgb(175, 47, 255));
    background-size: 300% auto;
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    animation: shine 4s linear infinite;
    margin: 0;
  }

  header p {
    font-size: 1.2rem;
    color: #555;
    margin-top: 0.5rem;
    font-weight: 400;
    animation: fadeInUp 1s ease forwards;
    color: white;
  }

  @keyframes shine {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>

<div class="container">
  <header>
    <h1>Memitos</h1>
    <p>Mira los memes más épicos del internet</p>
  </header>

  <meme-form></meme-form>
  <meme-gallery></meme-gallery>
  <meme-viewer></meme-viewer>
</div>
`;
    } else {
      console.error("shadowRoot es null");
    }
  }
}

customElements.define('app-root', AppRoot);
