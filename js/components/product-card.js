/**
 * Componente Product Card - Deliká
 * Uso: <product-card nome="Bolo de Cenoura" preco="R$ 27,00" imagem="img/bolo.jpg"></product-card>
 */
class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  get nome() {
    return this.getAttribute('nome') || 'Produto';
  }

  get preco() {
    return this.getAttribute('preco') || 'R$ 0,00';
  }

  get imagem() {
    return this.getAttribute('imagem') || '';
  }

  get categoria() {
    return this.getAttribute('categoria') || '';
  }

  render() {
    const style = `
      <style>
        :host {
          display: block;
        }
        .card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--sombra-card, 0 4px 15px rgba(0,0,0,0.1));
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(107, 45, 140, 0.2);
        }
        .card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        .card-content {
          padding: 1rem;
        }
        .card-title {
          font-family: var(--font-display, 'Playfair Display', serif);
          color: var(--roxo-delika, #6B2D8C);
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
        }
        .card-price {
          color: var(--roxo-escuro, #4A1C61);
          font-weight: 700;
          font-size: 1.1rem;
        }
        .card-category {
          display: inline-block;
          background: var(--lilas-claro, #E6D4F0);
          color: var(--roxo-delika, #6B2D8C);
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }
      </style>
    `;

    const imgHtml = this.imagem ? 
      `<img class="card-image" src="${this.imagem}" alt="${this.nome}" loading="lazy">` : '';

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="card">
        ${imgHtml}
        <div class="card-content">
          ${this.categoria ? `<span class="card-category">${this.categoria}</span>` : ''}
          <h3 class="card-title">${this.nome}</h3>
          <p class="card-price">${this.preco}</p>
        </div>
      </div>
    `;
  }
}

// Registrar componente
customElements.define('product-card', ProductCard);

// Componente de Toast/Notificação
class DelikaToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  show(mensagem, tipo = 'info') {
    const container = this.shadowRoot.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .toast {
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
        }
        .toast.show {
          opacity: 1;
          transform: translateX(0);
        }
        .toast-success { border-left: 4px solid #28a745; }
        .toast-error { border-left: 4px solid #dc3545; }
        .toast-info { border-left: 4px solid #6B2D8C; }
      </style>
      <div class="toast-container"></div>
    `;
  }
}

customElements.define('delika-toast', DelikaToast);

// Função global para mostrar toast
window.showToast = function(mensagem, tipo = 'info') {
  let toast = document.querySelector('delika-toast');
  if (!toast) {
    toast = document.createElement('delika-toast');
    document.body.appendChild(toast);
  }
  toast.show(mensagem, tipo);
};