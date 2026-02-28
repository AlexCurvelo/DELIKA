document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("js-enabled");

  const header = document.querySelector("header");
  const navLinks = document.querySelector(".nav-links");

  // Garante botão mobile em todas as páginas, inclusive itens.
  let menuToggle = document.querySelector(".menu-toggle");
  if (!menuToggle && navLinks) {
    menuToggle = document.createElement("button");
    menuToggle.className = "menu-toggle";
    menuToggle.setAttribute("aria-label", "Abrir menu");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    const logo = document.querySelector(".logo");
    if (logo && logo.parentElement) {
      logo.insertAdjacentElement("afterend", menuToggle);
    }
  }

  const menuIcon = menuToggle ? menuToggle.querySelector("i") : null;

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const isOpen = navLinks.classList.contains("active");
      if (menuIcon) {
        menuIcon.classList.toggle("fa-bars", !isOpen);
        menuIcon.classList.toggle("fa-xmark", isOpen);
      }
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        if (menuIcon) {
          menuIcon.classList.add("fa-bars");
          menuIcon.classList.remove("fa-xmark");
        }
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        navLinks.classList.remove("active");
        if (menuIcon) {
          menuIcon.classList.add("fa-bars");
          menuIcon.classList.remove("fa-xmark");
        }
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset - 20);
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // Evita imagem quebrada quando preview local ainda não existe.
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      const isItemPage = window.location.pathname.includes("/itens_cardapio/") || window.location.pathname.includes("\\itens_cardapio\\");
      const fallback = isItemPage ? "../img/bolo_mescladoLCChoc.jpg" : "img/bolo_mescladoLCChoc.jpg";
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "true";
        img.src = fallback;
      }
    });
  });

  // Funções do Carrinho (se estiver no cardápio)
  if (window.location.pathname.includes("cardapio.html")) {
    atualizarContadorCarrinho();
  }
});

// ========== FUNÇÕES DO CARRINHO ==========
// Limpar storage antigo se houver versões velhas
const oldKeys = ['delika_cart', 'delika_cart_v1', 'delika_cart_v2', 'delika_cart_v3', 'delika_cart_v4'];
oldKeys.forEach(key => localStorage.removeItem(key));

let carrinho = JSON.parse(localStorage.getItem("delika_cart_v5")) || [];

// Remover itens duplicados mantendo apenas o primeiro de cada
if (carrinho.length > 0) {
  const seen = new Set();
  carrinho = carrinho.filter(item => {
    const key = `${item.nome}-${item.preco}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  localStorage.setItem("delika_cart_v5", JSON.stringify(carrinho));
}

function exibirCarrinho() {
  const modal = document.getElementById("carrinhoModal");
  if (!modal) return;
  
  const itensContainer = document.getElementById("carrinhoItens");
  const vazioMsg = document.getElementById("carrinhoVazio");
  const finalizarBtn = document.getElementById("finalizarPedidoBtn");
  const formularioCliente = document.getElementById("formularioCliente");

  modal.style.display = "block";

  if (carrinho.length === 0) {
    vazioMsg.style.display = "block";
    itensContainer.style.display = "none";
    finalizarBtn.disabled = true;
    formularioCliente.style.display = "none";
    return;
  }

  vazioMsg.style.display = "none";
  itensContainer.style.display = "block";
  finalizarBtn.disabled = false;
  formularioCliente.style.display = "block";

  itensContainer.innerHTML = '';
  let total = 0;
  
  carrinho.forEach((item, index) => {
    const li = document.createElement("li");
    li.style.padding = "10px";
    li.style.borderBottom = "1px solid #eee";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    
    const precoTotal = item.preco;
    total += precoTotal;
    
    li.innerHTML = `
      <div>
        <strong>${item.nome}</strong>
        <br>
        <small>R$ ${item.preco.toFixed(2)}</small>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <strong>R$ ${precoTotal.toFixed(2)}</strong>
        <button onclick="removerItemCarrinho(${index})" 
                style="background: #ff4444; color: white; border: none; 
                       padding: 5px 10px; border-radius: 4px; cursor: pointer;">
          ✕
        </button>
      </div>
    `;
    itensContainer.appendChild(li);
  });

  // Adicionar linha de total
  const totalLi = document.createElement("li");
  totalLi.style.padding = "15px";
  totalLi.style.backgroundColor = "#f9f9f9";
  totalLi.style.borderTop = "2px solid #ddd";
  totalLi.style.fontWeight = "bold";
  totalLi.style.fontSize = "1.1em";
  totalLi.innerHTML = `Total: R$ ${total.toFixed(2)}`;
  itensContainer.appendChild(totalLi);
}

function adicionarAoCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  localStorage.setItem("delika_cart_v5", JSON.stringify(carrinho));
  atualizarContadorCarrinho();
  mostrarNotificacao(`${nome} adicionado ao carrinho!`);
}

function removerItemCarrinho(index) {
  carrinho.splice(index, 1);
  localStorage.setItem("delika_cart_v5", JSON.stringify(carrinho));
  exibirCarrinho();
  atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
  const contador = document.getElementById("contadorCarrinho");
  if (contador) {
    contador.textContent = carrinho.length > 0 ? carrinho.length : '';
  }
}

// Função para checkboxes do carrinho
function toggleCarrinhoCheckbox(checkbox, produto) {
  if (checkbox.checked) {
    adicionarAoCarrinho(produto.nome, produto.preco);
    // Mostrar popup do carrinho após adicionar
    setTimeout(() => {
      exibirCarrinho();
    }, 300);
  } else {
    // Remove item específico do carrinho
    const index = carrinho.findIndex(item => 
      item.nome === produto.nome && item.preco === produto.preco
    );
    if (index > -1) {
      removerItemCarrinho(index);
    }
  }
}

function enviarPedidoWhatsApp() {
  if (carrinho.length === 0) return;

  const nomeCliente = document.getElementById("clienteNome").value.trim();
  const telefoneCliente = document.getElementById("clienteTelefone").value.trim();

  if (!nomeCliente || !telefoneCliente) {
    mostrarNotificacao("Por favor, preencha seu nome e telefone!", "erro");
    return;
  }

  let mensagem = `Olá! Eu sou *${nomeCliente}* (${telefoneCliente}) e gostaria de encomendar:\n\n`;
  let total = 0;

  carrinho.forEach(item => {
    mensagem += `• ${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
    total += item.preco;
  });

  mensagem += `\n💰 *Total: R$ ${total.toFixed(2)}*`;
  mensagem += "\n\n---\n*Deliká Bolos e Doces*";

  const numeroWhatsApp = "5511974757194";
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  
  window.open(url, "_blank");
  carrinho = [];
  localStorage.removeItem("delika_cart_v5");
  atualizarContadorCarrinho();
  const modal = document.getElementById("carrinhoModal");
  if (modal) modal.style.display = "none";
  
  // Desmarcar todos os checkboxes do cardápio
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });

  // Resetar formulário do modal
  const form = document.getElementById("formularioCliente");
  if (form) {
    form.reset();
    form.style.display = "none"; // Esconder até novo pedido
  }
  
  // Mostrar mensagem de carrinho vazio e resetar UI completamente
  const vazioMsg = document.getElementById("carrinhoVazio");
  const itensContainer = document.getElementById("carrinhoItens");
  const finalizarBtn = document.getElementById("finalizarPedidoBtn");
  
  if (vazioMsg) vazioMsg.style.display = "block";
  if (itensContainer) {
    itensContainer.style.display = "none";
    itensContainer.innerHTML = ''; // Limpar completamente a lista
  }
  if (finalizarBtn) finalizarBtn.disabled = true;
}


// Função para mostrar notificações toast
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
  // Criar elemento de notificação
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${tipo === 'sucesso' ? 'var(--verde-sucesso)' : 'var(--vermelho-erro)'};
    color: white;
    padding: 12px 18px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    font-size: 0.9rem;
    font-weight: 500;
  `;
  toast.innerHTML = `
    <i class="fa-solid ${tipo === 'sucesso' ? 'fa-check' : 'fa-xmark'}" style="margin-right: 8px;"></i>
    ${mensagem}
  `;
  document.body.appendChild(toast);

  // Remover após 3 segundos
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Função para fechar o modal do carrinho
function fecharCarrinhoModal() {
  const modal = document.getElementById("carrinhoModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Adicionar estilos CSS para animação
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

// Fechar modal ao clicar fora
document.addEventListener("click", (event) => {
  const modal = document.getElementById("carrinhoModal");
  if (modal && event.target === modal) {
    modal.style.display = "none";
  }
});



