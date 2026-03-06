/**
 * 🛒 VITRINE DINÂMICA DELIKÁ
 * 
 * Arquitetura: Local-First - Renderiza produtos do localStorage
 * Versão: v1.0
 * 
 * Este script transforma a Vitrine em uma aplicação dinâmica que:
 * 1. Lê produtos do localStorage (delika_catalog_v5)
 * 2. Exibe apenas produtos com status === 'ativo'
 * 3. Carrega banners de produtos destacados
 * 4. Sincroniza em tempo real com o ADM
 */

(function() {
  'use strict';

  // ==========================================
  // 🔧 CONFIGURAÇÃO
  // ==========================================
  const CONFIG = {
    STORAGE_KEY: 'delika_catalog_v5',
    STORAGE_KEY_RECIPES: 'delika_recipes_v5',
    STORAGE_KEY_INVENTORY: 'delika_inventory_v5',
    SESSION_KEY: 'delika_adm_session_v1'
  };

  // ==========================================
  // 🗄️ FUNÇÕES DO BANCO (Mini-DB)
  // ==========================================
  const VitrineDB = {
    // Verificar se está logado no ADM
    isAdminLoggedIn: function() {
      try {
        const session = localStorage.getItem(CONFIG.SESSION_KEY);
        if (!session) return false;
        
        const sessionData = JSON.parse(session);
        const now = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 horas
        
        return (now - sessionData.timestamp) < sessionDuration;
      } catch (e) {
        return false;
      }
    },

    // Obter catálogo completo
    getCatalog: function() {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Erro ao ler catálogo:', e);
        return [];
      }
    },

    // Obter apenas produtos ativos
    getActiveProducts: function() {
      const catalog = this.getCatalog();
      return catalog.filter(p => p.status === 'ativo');
    },

    // Obter produtos em destaque para o banner
    getFeaturedProducts: function() {
      const catalog = this.getCatalog();
      return catalog.filter(p => p.status === 'ativo' && p.destaque === true);
    },

    // Obter produtos por categoria
    getProductsByCategory: function(category) {
      const activeProducts = this.getActiveProducts();
      if (!category || category === 'all') return activeProducts;
      return activeProducts.filter(p => p.category === category);
    },

    // Obter todas as categorias únicas
    getCategories: function() {
      const catalog = this.getActiveProducts();
      const categories = [...new Set(catalog.map(p => p.category))];
      return categories.filter(c => c); // Remove empty/null
    },

    // Verificar se produto está esgotado (sem estoque)
    isProductAvailable: function(product) {
      try {
        // Se não tem receita vinculada, está disponível
        if (!product.recipeId) return true;
        
        const recipesData = localStorage.getItem(CONFIG.STORAGE_KEY_RECIPES);
        if (!recipesData) return true;
        
        const recipes = JSON.parse(recipesData);
        const recipe = recipesData.find(r => r.id === product.recipeId);
        
        // Se não tem receita, está disponível
        if (!recipe || !recipe.ingredients) return true;
        
        // Verificar se tem ingredientes suficientes
        const inventoryData = localStorage.getItem(CONFIG.STORAGE_KEY_INVENTORY);
        if (!inventoryData) return true;
        
        const inventory = JSON.parse(inventoryData);
        
        // Verificar cada ingrediente
        for (const ing of recipe.ingredients) {
          const item = inventory.find(i => i.id === ing.inventoryId);
          if (!item || item.quantity < ing.quantity) {
            return false; // Não tem ingrediente suficiente
          }
        }
        
        return true;
      } catch (e) {
        return true; // Em caso de erro, mostra como disponível
      }
    },

    // Obter dados da empresa
    getCompanyData: function() {
      try {
        const data = localStorage.getItem('delika_company_data');
        return data ? JSON.parse(data) : null;
      } catch (e) {
        return null;
      }
    }
  };

  // ==========================================
  // 🎨 RENDERIZADORES
  // ==========================================
  const Renderer = {
    // Renderizar banner rotativo com produtos em destaque
    renderBanner: function() {
      const featured = VitrineDB.getFeaturedProducts();
      const bannerSlider = document.getElementById('bannerSlider');
      const bannerControls = document.querySelector('.banner-controls');
      
      if (!bannerSlider) return;
      
      // Se não tem produtos destacados, usa banners padrão
      if (featured.length === 0) {
        return; // Mantém os slides HTML estáticos
      }
      
      // Limpar slides existentes e criar novos
      bannerSlider.innerHTML = '';
      
      featured.forEach((product, index) => {
        const slide = document.createElement('div');
        slide.className = 'banner-slide';
        slide.innerHTML = `
          <img src="${product.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80'}" 
               alt="${product.name}">
          <div class="banner-overlay">
            <h1 class="banner-title">${product.name}</h1>
            ${product.description ? `<p style="color: white; margin-top: 10px;">${product.description}</p>` : ''}
            <p style="color: var(--dourado); font-size: 1.5rem; font-weight: bold; margin-top: 10px;">
              ${formatCurrency(product.price)}
            </p>
          </div>
        `;
        bannerSlider.appendChild(slide);
      });
      
      // Atualizar dots
      if (bannerControls) {
        bannerControls.innerHTML = '';
        featured.forEach((_, index) => {
          const dot = document.createElement('span');
          dot.className = 'banner-dot' + (index === 0 ? ' active' : '');
          dot.dataset.slide = index;
          dot.addEventListener('click', () => goToSlide(index));
          bannerControls.appendChild(dot);
        });
      }
      
      // Reinicializar slider
      initBannerSlider();
    },

    // Renderizar cards de produtos
    renderProducts: function(category = 'all', containerId = 'productsGrid') {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const products = VitrineDB.getProductsByCategory(category);
      
      if (products.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-birthday-cake" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
            <h3 style="color: #666; margin-bottom: 10px;">Nenhum produto disponível</h3>
            <p style="color: #999;">Em breve novos produtos!</p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = products.map(product => {
        const isAvailable = VitrineDB.isProductAvailable(product);
        const btnDisabled = !isAvailable ? 'disabled' : '';
        const btnText = isAvailable ? 'Encomendar' : 'Esgotado';
        const btnClass = isAvailable ? 'btn-primary' : 'btn-disabled';
        
        return `
          <div class="product-card ${!isAvailable ? 'sold-out' : ''}">
            <div class="product-image">
              <img src="${product.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80'}" 
                   alt="${product.name}">
              ${!isAvailable ? '<div class="sold-out-badge">Esgotado</div>' : ''}
              ${product.destaque ? '<div class="featured-badge">Destaque</div>' : ''}
            </div>
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.description || 'Delicioso bolo caseiro'}</p>
              <div class="product-price">${formatCurrency(product.price)}</div>
              <button class="${btnClass}" onclick="openOrderModal('${product.id}')" ${btnDisabled}>
                <i class="fas fa-shopping-bag"></i> ${btnText}
              </button>
            </div>
          </div>
        `;
      }).join('');
    },

    // Renderizar filtros de categoria
    renderCategoryFilters: function() {
      const container = document.getElementById('categoryFilters');
      if (!container) return;
      
      const categories = VitrineDB.getCategories();
      const allCategories = ['all', ...categories];
      
      container.innerHTML = allCategories.map((cat, index) => {
        const label = cat === 'all' ? 'Todos' : cat;
        const active = index === 0 ? 'active' : '';
        return `<button class="filter-btn ${active}" onclick="filterProducts('${cat}')">${label}</button>`;
      }).join('');
    },

    // Atualizar dados da empresa no footer
    updateCompanyData: function() {
      const company = VitrineDB.getCompanyData();
      if (!company) return;
      
      // Atualizar telefone se existir
      if (company.phone) {
        const phoneEl = document.querySelector('.footer-contact p a');
        if (phoneEl) {
          phoneEl.textContent = company.phone;
          phoneEl.href = `tel:${company.phone.replace(/\D/g, '')}`;
        }
      }
    }
  };

  // ==========================================
  // 🎯 EVENTOS
  // ==========================================
  
  // Filtrar produtos por categoria
  window.filterProducts = function(category) {
    // Atualizar botão ativo
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.toLowerCase() === category.toLowerCase() || 
          (category === 'all' && btn.textContent === 'Todos')) {
        btn.classList.add('active');
      }
    });
    
    // Renderizar produtos filtrados
    Renderer.renderProducts(category);
  };

  // Abrir modal de pedido
  window.openOrderModal = function(productId) {
    const catalog = VitrineDB.getCatalog();
    const product = catalog.find(p => p.id === productId);
    
    if (!product) {
      alert('Produto não encontrado!');
      return;
    }
    
    // Criar mensagem para WhatsApp
    const message = encodeURIComponent(
      `Olá! Gostaria de fazer um pedido:\n\n` +
      `*Produto:* ${product.name}\n` +
      `*Preço:* ${formatCurrency(product.price)}\n` +
      `*Descrição:* ${product.description || 'Sem descrição'}\n\n` +
      `Aguardo confirmação!`
    );
    
    // Obter WhatsApp da empresa
    const company = VitrineDB.getCompanyData();
    const phone = company?.whatsapp || '5511974757194';
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // ==========================================
  // 🎠 BANNER SLIDER
  // ==========================================
  let currentSlide = 0;
  let autoSlideInterval;

  function goToSlide(index) {
    const slides = document.querySelectorAll('.banner-slide');
    if (slides.length === 0) return;
    
    const bannerSlider = document.getElementById('bannerSlider');
    if (!bannerSlider) return;
    
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    currentSlide = index;
    bannerSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    document.querySelectorAll('.banner-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  function initBannerSlider() {
    const prevBtn = document.querySelector('.banner-arrow.prev');
    const nextBtn = document.querySelector('.banner-arrow.next');
    const bannerSlider = document.getElementById('bannerSlider');
    
    if (prevBtn) {
      prevBtn.onclick = () => { prevSlide(); stopAutoSlide(); startAutoSlide(); };
    }
    
    if (nextBtn) {
      nextBtn.onclick = () => { nextSlide(); stopAutoSlide(); startAutoSlide(); };
    }
    
    if (bannerSlider) {
      bannerSlider.addEventListener('mouseenter', stopAutoSlide);
      bannerSlider.addEventListener('mouseleave', startAutoSlide);
    }
    
    startAutoSlide();
  }

  // ==========================================
  // 🔄 SINCRONIZAÇÃO EM TEMPO REAL
  // ==========================================
  
  // Ouvir mudanças no localStorage (de outras abas)
  window.addEventListener('storage', function(e) {
    if (e.key === CONFIG.STORAGE_KEY || 
        e.key === CONFIG.STORAGE_KEY_RECIPES ||
        e.key === CONFIG.STORAGE_KEY_INVENTORY) {
      console.log('🔄 Dados atualizados, recarregando Vitrine...');
      Renderer.renderBanner();
      Renderer.renderProducts();
      Renderer.renderCategoryFilters();
      Renderer.updateCompanyData();
    }
  });

  // ==========================================
  // 💰 UTILITÁRIOS
  // ==========================================
  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // ==========================================
  // 🚀 INICIALIZAÇÃO
  // ==========================================
  function init() {
    console.log('🛒 Carregando Vitrine Dinâmica Deliká...');
    
    // Renderizar componentes
    Renderer.renderBanner();
    Renderer.renderProducts();
    Renderer.renderCategoryFilters();
    Renderer.updateCompanyData();
    
    console.log('✅ Vitrine Dinâmica carregada com sucesso!');
  }

  // Iniciar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
