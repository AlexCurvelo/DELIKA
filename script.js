/**
 * Deliká - Script Principal
 * Sistema de gerenciamento de cardápio e carrinho
 */

// Variável global para o carrinho
window.carrinho = [];

/**
 * Inicializar o sistema quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar menu mobile
  initMenuMobile();
  
  // Carregar produtos do cardápio
  await carregarProdutos();
  
  // Inicializar carrinho do localStorage
  initCarrinho();
});

/**
 * Menu Mobile - Toggle
 */
function initMenuMobile() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('active');
      
      // Atualizar ícone
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }
}

/**
 * Carregar produtos do cardápio
 */
async function carregarProdutos() {
  const grid = document.getElementById('grid-cardapio-dinamico');
  if (!grid) return;
  
  try {
    // Tentar carregar do store
    let produtos = [];
    
    if (window.DelikaDB) {
      produtos = await window.DelikaDB.getProdutos();
    }
    
    // Se não houver produtos, usar fallback
    if (!produtos || produtos.length === 0) {
      produtos = getProdutosFallback();
    }
    
    // Renderizar produtos
    renderizarProdutos(produtos);
    
  } catch (erro) {
    console.error('Erro ao carregar produtos:', erro);
    grid.innerHTML = `
      <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--error);">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Erro ao carregar cardápio. Tente novamente.</p>
      </div>
    `;
  }
}

/**
 * Produtos fallback (quando não há dados no store)
 */
function getProdutosFallback() {
  return [
    {
      id: 'bolo-simples-1',
      nome: 'Fubá com Goiabada',
      descricao: 'O sabor da infância em cada fatia.',
      preco: 27.00,
      categoria: 'bolos-simples',
      imagem: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      destaque: true
    },
    {
      id: 'bolo-vulcao-1',
      nome: 'Bolo Vulcão',
      descricao: 'Cobertura generosa e sabor irresistível.',
      preco: 55.00,
      categoria: 'bolos-vulcao',
      imagem: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80',
      destaque: true
    },
    {
      id: 'sobremesa-1',
      nome: 'Torta Holandesa',
      descricao: 'Uma combinação clássica de cream cheese, biscoito e chocolate.',
      preco: 45.00,
      categoria: 'sobremesas',
      imagem: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=800&q=80',
      destaque: false
    },
    {
      id: 'doce-1',
      nome: 'Brigadeiro Gourmet',
      descricao: 'Bolinhos de chocolate com acabamento premium.',
      preco: 3.50,
      categoria: 'doces',
      imagem: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=80',
      destaque: false
    },
    {
      id: 'fit-1',
      nome: 'Bolo Fit Banana',
      descricao: 'Opção deliciosa sem açúcar e sem lactose.',
      preco: 32.00,
      categoria: 'fit',
      imagem: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
      destaque: false
    },
    {
      id: 'bolo-especial-1',
      nome: 'Charlotte de Morango',
      descricao: 'Sobremesa elegante com morangos frescos.',
      preco: 65.00,
      categoria: 'especiais',
      imagem: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
      destaque: true
    }
  ];
}

/**
 * Renderizar produtos no grid
 */
function renderizarProdutos(produtos) {
  const grid = document.getElementById('grid-cardapio-dinamico');
  if (!grid) return;
  
  // Filtrar apenas produtos ativos
  const produtosAtivos = produtos.filter(p => p.ativo !== false);
  
  if (produtosAtivos.length === 0) {
    grid.innerHTML = `
      <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 50px;">
        <i class="fa-solid fa-cookie"></i>
        <p>Nenhum produto disponível no momento.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = produtosAtivos.map(produto => `
    <article class="card" data-categoria="${produto.categoria || ''}">
      <div class="card-img-wrapper" style="position: relative; overflow: hidden;">
        <img src="${produto.imagem || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'}" 
             alt="${produto.nome}" 
             loading="lazy">
        ${produto.destaque ? `
          <span style="position: absolute; top: 15px; right: 15px; background: var(--dourado); color: var(--roxo-escuro); padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">Destaque</span>
        ` : ''}
      </div>
      <div class="card-content" style="padding: 20px;">
        <span class="categoria-tag" style="display: inline-block; background: var(--lilas-claro); color: var(--roxo-delika); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px;">${formatarCategoria(produto.categoria)}</span>
        <h3 style="font-size: 1.3rem; margin-bottom: 8px;">${produto.nome}</h3>
        <p style="font-size: 0.9rem; color: #555; margin-bottom: 15px;">${produto.descricao || ''}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="preco" style="font-size: 1.2rem; font-weight: 700; color: var(--roxo-escuro); margin: 0;">
            ${formatarPreco(produto.preco)}
          </span>
          <button class="btn-secondary" style="margin: 0; padding: 8px 16px; font-size: 0.9rem;" onclick="adicionarAoCarrinho('${produto.id}', '${produto.nome}', ${produto.preco})">
            <i class="fa-solid fa-plus"></i> Adicionar
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

/**
 * Formatar categoria para exibição
 */
function formatarCategoria(categoria) {
  const categorias = {
    'bolos-simples': 'Clássico',
    'bolos-vulcao': 'Vulcão',
    'sobremesas': 'Sobremesa',
    'doces': 'Doce',
    'fit': 'Fit',
    'especiais': 'Especial'
  };
  return categorias[categoria] || categoria || 'Produto';
}

/**
 * Formatar preço para Real brasileiro
 */
function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Inicializar carrinho do localStorage
 */
function initCarrinho() {
  try {
    const dados = localStorage.getItem('delika_carrinho');
    if (dados) {
      window.carrinho = JSON.parse(dados);
    }
  } catch (e) {
    console.warn('Erro ao carregar carrinho:', e);
    window.carrinho = [];
  }
}

/**
 * Salvar carrinho no localStorage
 */
function salvarCarrinho() {
  try {
    localStorage.setItem('delika_carrinho', JSON.stringify(window.carrinho));
    atualizarContadorCarrinho();
  } catch (e) {
    console.warn('Erro ao salvar carrinho:', e);
  }
}

/**
 * Adicionar item ao carrinho
 */
function adicionarAoCarrinho(id, nome, preco) {
  const itemExistente = window.carrinho.find(item => item.id === id);
  
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    window.carrinho.push({
      id: id,
      nome: nome,
      preco: preco,
      quantidade: 1
    });
  }
  
  salvarCarrinho();
  
  // Feedback visual
  mostrarToast(`${nome} adicionado à sacola!`, 'success');
  
  // Se houver modal aberto, atualizar
  const modal = document.getElementById('carrinhoModal');
  if (modal && modal.classList.contains('active')) {
    renderizarItensCarrinho();
  }
}

/**
 * Remover item do carrinho
 */
function removerDoCarrinho(id) {
  window.carrinho = window.carrinho.filter(item => item.id !== id);
  salvarCarrinho();
  renderizarItensCarrinho();
}

/**
 * Atualizar quantidade de um item
 */
function atualizarQuantidade(id, delta) {
  const item = window.carrinho.find(item => item.id === id);
  if (item) {
    item.quantidade += delta;
    if (item.quantidade <= 0) {
      removerDoCarrinho(id);
    } else {
      salvarCarrinho();
      renderizarItensCarrinho();
    }
  }
}

/**
 * Calcular total do carrinho
 */
function calcularTotal() {
  return window.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

/**
 * Atualizar contador do carrinho no header
 */
function atualizarContadorCarrinho() {
  const totalItens = window.carrinho.reduce((sum, item) => sum + item.quantidade, 0);
  
  // Atualizar badge se existir
  let badge = document.querySelector('.carrinho-badge');
  if (totalItens > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'carrinho-badge';
      badge.style.cssText = 'background: #ff6b6b; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; margin-left: 5px;';
    }
    badge.textContent = totalItens;
    
    // Adicionar ao botão do carrinho se ainda não tiver
    const btnCarrinho = document.querySelector('.nav-links .btn-whatsapp');
    if (btnCarrinho && !btnCarrinho.querySelector('.carrinho-badge')) {
      btnCarrinho.insertAdjacentElement('beforeend', badge);
    }
  } else if (badge) {
    badge.remove();
  }
}

/**
 * Exibir modal do carrinho
 */
function exibirCarrinho() {
  const modal = document.getElementById('carrinhoModal');
  if (modal) {
    renderizarItensCarrinho();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Fechar modal do carrinho
 */
function fecharCarrinhoModal() {
  const modal = document.getElementById('carrinhoModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Renderizar itens do carrinho no modal
 */
function renderizarItensCarrinho() {
  const listaItens = document.getElementById('carrinhoItens');
  const containerVazio = document.getElementById('carrinhoVazio');
  const elementoTotal = document.getElementById('carrinhoTotal');
  
  if (!listaItens) return;
  
  if (window.carrinho.length === 0) {
    listaItens.innerHTML = '';
    if (containerVazio) containerVazio.style.display = 'block';
    if (elementoTotal) elementoTotal.textContent = 'R$ 0,00';
    return;
  }
  
  if (containerVazio) containerVazio.style.display = 'none';
  
  listaItens.innerHTML = window.carrinho.map(item => `
    <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
      <div style="flex: 1;">
        <strong style="display: block;">${item.nome}</strong>
        <span style="color: #666; font-size: 0.9rem;">${formatarPreco(item.preco)}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button onclick="atualizarQuantidade('${item.id}', -1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">-</button>
        <span style="min-width: 20px; text-align: center;">${item.quantidade}</span>
        <button onclick="atualizarQuantidade('${item.id}', 1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">+</button>
        <button onclick="removerDoCarrinho('${item.id}')" style="margin-left: 10px; color: var(--error); background: none; border: none; cursor: pointer;">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </li>
  `).join('');
  
  if (elementoTotal) {
    elementoTotal.textContent = formatarPreco(calcularTotal());
  }
}

/**
 * Mostrar notificação toast
 */
function mostrarToast(mensagem, tipo = 'info') {
  // Criar container se não existir
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `
    <i class="fa-solid fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'circle-exclamation' : 'info-circle'}"></i>
    <span>${mensagem}</span>
  `;
  
  container.appendChild(toast);
  
  // Remover após 3 segundos
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
  const modal = document.getElementById('carrinhoModal');
  if (modal && e.target === modal) {
    fecharCarrinhoModal();
  }
});

// Fechar modal com Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharCarrinhoModal();
  }
});

// Função global para兼容性
window.exibirCarrinho = exibirCarrinho;
window.fecharCarrinhoModal = fecharCarrinhoModal;
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.atualizarQuantidade = atualizarQuantidade;