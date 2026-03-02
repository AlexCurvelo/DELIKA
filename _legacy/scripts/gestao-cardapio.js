/**
 * Sistema de Gestão de Cardápio para Deliká
 * Funcionalidades completas com edição
 */

document.addEventListener('DOMContentLoaded', function() {
    if (window.DelikAuth && !DelikAuth.getSession()) {
        window.location.href = 'login.html';
        return;
    }

    // Variáveis globais
    let categorias = JSON.parse(localStorage.getItem('delika_categorias')) || [
        { id: 1, nome: 'Bolos Simples' },
        { id: 2, nome: 'Bolos Especiais' },
        { id: 3, nome: 'Doces e Sobremesas' }
    ];

    let itens = JSON.parse(localStorage.getItem('delika_itens')) || [];
    let editandoItemId = null;

    // Elementos da interface
    const categoriasContainer = document.getElementById('categoriasContainer');
    const addCategoriaBtn = document.getElementById('addCategoriaBtn');
    const itemForm = document.getElementById('itemForm');
    const itensList = document.getElementById('itensList');
    const itemCategoria = document.getElementById('itemCategoria');
    const modal = document.getElementById('modalProduto');
    const modalTitulo = document.getElementById('modalTitulo');

    // Carregar categorias
    function carregarCategorias() {
        categoriasContainer.innerHTML = '';
        itemCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';
        
        categorias.forEach(categoria => {
            // Container de categorias
            const categoriaItem = document.createElement('div');
            categoriaItem.className = 'categoria-item';
            categoriaItem.innerHTML = `
                <input type="text" value="${categoria.nome}" class="categoria-nome" 
                       data-id="${categoria.id}">
                <button class="btn-remove-categoria" data-id="${categoria.id}">
                    <i class="fas fa-minus"></i>
                </button>
            `;
            categoriasContainer.appendChild(categoriaItem);

            // Dropdown do formulário
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nome;
            itemCategoria.appendChild(option);
        });

        // Event listeners
        document.querySelectorAll('.btn-remove-categoria').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                removerCategoria(id);
            });
        });

        document.querySelectorAll('.categoria-nome').forEach(input => {
            input.addEventListener('change', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const novoNome = this.value.trim();
                atualizarCategoria(id, novoNome);
            });
        });
    }

    // Funções de categorias
    function adicionarCategoria(nome) {
        categorias.push({ id: Date.now(), nome: nome.trim() });
        salvarCategorias();
        carregarCategorias();
    }

    function removerCategoria(id) {
        if (confirm('Tem certeza que deseja remover esta categoria?')) {
            categorias = categorias.filter(c => c.id !== id);
            salvarCategorias();
            carregarCategorias();
        }
    }

    function atualizarCategoria(id, novoNome) {
        const categoria = categorias.find(c => c.id === id);
        if (categoria && novoNome) {
            categoria.nome = novoNome;
            salvarCategorias();
        }
    }

    function salvarCategorias() {
        localStorage.setItem('delika_categorias', JSON.stringify(categorias));
    }

    // Carregar itens com funcionalidade de edição
    function carregarItens() {
        itensList.innerHTML = '';
        
        itens.forEach(item => {
            const categoria = categorias.find(c => c.id === item.categoria) || { nome: 'Sem Categoria' };
            
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';
            itemElement.innerHTML = `
                <div class="item-imagem">
                    <img src="${item.imagem || '../img/placeholder-produto.jpg'}" 
                         alt="${item.nome}" loading="lazy">
                </div>
                <div class="item-info">
                    <h3>${item.nome}</h3>
                    <p class="item-categoria">${categoria.nome}</p>
                    <p class="item-preco">R$ ${item.preco}</p>
                    <div class="item-actions">
                        <label class="toggle-label">
                            <input type="checkbox" ${item.noCardapio ? 'checked' : ''} 
                                   data-id="${item.id}" class="toggle-cardapio">
                            <span>No Cardápio</span>
                        </label>
                        <button class="btn-editar" data-id="${item.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-excluir" data-id="${item.id}">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
            itensList.appendChild(itemElement);
        });

        // Event listeners
        document.querySelectorAll('.toggle-cardapio').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const item = itens.find(i => i.id === id);
                if (item) {
                    item.noCardapio = this.checked;
                    salvarItens();
                    if (this.checked) gerarPaginaItem(item);
                }
            });
        });

        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                abrirModalEdicao(id);
            });
        });

        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                excluirItem(id);
            });
        });
    }

    // Modal de edição
    function abrirModalEdicao(id) {
        const item = itens.find(i => i.id === id);
        if (!item) return;

        editandoItemId = id;
        modalTitulo.textContent = 'Editar Produto';
        
        // Preencher formulário
        document.getElementById('produtoNome').value = item.nome;
        document.getElementById('produtoDescricao').value = item.descricao;
        document.getElementById('produtoPreco').value = item.preco;
        document.getElementById('produtoImagem').value = item.imagem || '';
        document.getElementById('produtoCategoria').value = item.categoria;
        document.getElementById('produtoId').value = item.id;
        
        atualizarPreview(item.imagem);
        modal.style.display = 'flex';
    }

    // Funções de itens
    function adicionarItem(item) {
        itens.push(item);
        salvarItens();
        carregarItens();
        if (item.noCardapio) gerarPaginaItem(item);
    }

    function atualizarItem(itemAtualizado) {
        const index = itens.findIndex(i => i.id === itemAtualizado.id);
        if (index !== -1) {
            itens[index] = { ...itens[index], ...itemAtualizado };
            salvarItens();
            carregarItens();
            if (itemAtualizado.noCardapio) gerarPaginaItem(itemAtualizado);
        }
    }

    function excluirItem(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            itens = itens.filter(i => i.id !== id);
            salvarItens();
            carregarItens();
        }
    }

    function salvarItens() {
        localStorage.setItem('delika_itens', JSON.stringify(itens));
    }

    function gerarPaginaItem(item) {
        console.log('?? Gerando página para:', item.nome);
        // Implementar geração da página
    }

    // Event listeners principais
    addCategoriaBtn.addEventListener('click', function() {
        const nome = prompt('Nome da nova categoria:');
        if (nome && nome.trim()) adicionarCategoria(nome);
    });

    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const itemData = {
            nome: document.getElementById('itemNome').value.trim(),
            descricao: document.getElementById('itemDescricao').value.trim(),
            preco: parseFloat(document.getElementById('itemPreco').value),
            categoria: parseInt(document.getElementById('itemCategoria').value),
            imagem: '', // Implementar upload depois
            noCardapio: document.getElementById('itemAtivo').checked
        };

        if (!validarItem(itemData)) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        if (editandoItemId) {
            // Modo edição
            itemData.id = editandoItemId;
            atualizarItem(itemData);
            editandoItemId = null;
        } else {
            // Novo item
            adicionarItem({ ...itemData, id: Date.now(), dataCriacao: new Date().toISOString() });
        }

        itemForm.reset();
        fecharModal();
    });

    // Funções auxiliares
    function validarItem(item) {
        return item.nome && item.descricao && !isNaN(item.preco) && !isNaN(item.categoria);
    }

    function fecharModal() {
        modal.style.display = 'none';
        editandoItemId = null;
        itemForm.reset();
    }

    function atualizarPreview(url) {
        const preview = document.getElementById('previewImagem');
        preview.src = url && url.trim() ? 
            (url.toLowerCase().startsWith('http') ? url : '../img/' + url) : 
            '../img/placeholder-produto.jpg';
    }

    // Inicialização
    carregarCategorias();
    carregarItens();

    // Event listener para fechar modal
    document.addEventListener('click', function(e) {
        if (e.target === modal) fecharModal();
    });
});