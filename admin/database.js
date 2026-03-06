/**
 * 🏗️ DELIKA DATABASE - Sistema Nervoso Central do ERP Local-First
 * 
 * Arquitetura: Local-First com localStorage
 * Versão: v5.0
 * Autor: CURVELO HUB v10.9
 * 
 * Este arquivo gerencia todas as operações de persistência e as relações
 * entre os módulos do sistema (Estoque, Custos, Produtos, Pedidos).
 * 
 * @see manual_arquitetura_adm_delika.txt para documentação completa
 */

// ==========================================
// 🔐 CONFIGURAÇÃO DAS CHAVES DE STORAGE
// ==========================================
const DB_CONFIG = {
  // Versão do banco para migrações futuras
  VERSION: 'v5.0',
  
  // Chaves de localStorage para cada entidade
  KEYS: {
    // Catálogo de produtos (visível na vitrine pública)
    CATALOG: 'delika_catalog_v5',
    
    // Receitas/fichas técnicas dos produtos
    RECIPES: 'delika_recipes_v5',
    
    // Inventário/Estoque de insumos
    INVENTORY: 'delika_inventory_v5',
    
    // Pedidos do sistema (Kanban)
    ORDERS: 'pedidosDelika',
    
    // Clientes/CRM
    CLIENTS: 'delika_clients_v5',
    
    // Fluxo financeiro (lucro, despesas)
    FINANCE: 'delika_cashflow_v1'
  }
};

// ==========================================
// 🗄️ CLASSE PRINCIPAL DO BANCO
// ==========================================
class DelikaDB {
  constructor() {
    // Inicializar banco se necessário
    this.initialize();
  }

  /**
   * 💾 Salvar dados genérico
   * @param {string} key - Chave do localStorage
   * @param {Array|Object} data - Dados a salvar
   */
  save(key, data) {
    try {
      const dataString = JSON.stringify(data);
      localStorage.setItem(key, dataString);
      return { success: true };
    } catch (error) {
      console.error(`Erro ao salvar em ${key}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📖 Buscar dados genérico
   * @param {string} key - Chave do localStorage
   * @returns {Array|Object|null} Dados ou null se não existir
   */
  get(key) {
    try {
      const dataString = localStorage.getItem(key);
      if (!dataString) return null;
      return JSON.parse(dataString);
    } catch (error) {
      console.error(`Erro ao ler de ${key}:`, error);
      return null;
    }
  }

  /**
   * 🗑️ Deletar dados
   * @param {string} key - Chave do localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error(`Erro ao deletar ${key}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Verificar se existe dado
   * @param {string} key - Chave do localStorage
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  }

  // ==========================================
  // 📦 MÉTODOS ESPECÍFICOS - CATÁLOGO (PRODUTOS)
  // ==========================================

  /**
   * Obter todos os produtos do catálogo
   */
  getCatalog() {
    return this.get(DB_CONFIG.KEYS.CATALOG) || [];
  }

  /**
   * Salvar catálogo completo
   */
  saveCatalog(catalog) {
    return this.save(DB_CONFIG.KEYS.CATALOG, catalog);
  }

  /**
   * Obter produto específico por ID
   */
  getProduct(id) {
    const catalog = this.getCatalog();
    return catalog.find(p => p.id === id) || null;
  }

  /**
   * Criar novo produto
   */
  createProduct(product) {
    const catalog = this.getCatalog();
    const newProduct = {
      id: this.generateId(),
      name: product.name,
      description: product.description || '',
      image: product.image || '',
      price: parseFloat(product.price) || 0,
      category: product.category || 'Outros',
      status: product.status || 'ativo',
      recipeId: product.recipeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    catalog.push(newProduct);
    this.saveCatalog(catalog);
    return newProduct;
  }

  /**
   * Atualizar produto
   */
  updateProduct(id, updates) {
    const catalog = this.getCatalog();
    const index = catalog.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    catalog[index] = {
      ...catalog[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveCatalog(catalog);
    return catalog[index];
  }

  /**
   * Deletar produto
   */
  deleteProduct(id) {
    const catalog = this.getCatalog();
    const filtered = catalog.filter(p => p.id !== id);
    this.saveCatalog(filtered);
    return filtered.length < catalog.length;
  }

  // ==========================================
  // 📝 MÉTODOS ESPECÍFICOS - RECEITAS
  // ==========================================

  /**
   * Obter todas as receitas
   */
  getRecipes() {
    return this.get(DB_CONFIG.KEYS.RECIPES) || [];
  }

  /**
   * Salvar receitas
   */
  saveRecipes(recipes) {
    return this.save(DB_CONFIG.KEYS.RECIPES, recipes);
  }

  /**
   * Obter receita por ID
   */
  getRecipe(id) {
    const recipes = this.getRecipes();
    return recipes.find(r => r.id === id) || null;
  }

  /**
   * Criar nova receita
   */
  createRecipe(recipe) {
    const recipes = this.getRecipes();
    const newRecipe = {
      id: this.generateId(),
      name: recipe.name,
      description: recipe.description || '',
      category: recipe.category || 'Outros',
      ingredients: recipe.ingredients || [],
      laborCost: parseFloat(recipe.laborCost) || 0,
      margin: parseFloat(recipe.margin) || 0.5, // 50% padrão
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    recipes.push(newRecipe);
    this.saveRecipes(recipes);
    return newRecipe;
  }

  /**
   * Atualizar receita
   */
  updateRecipe(id, updates) {
    const recipes = this.getRecipes();
    const index = recipes.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    recipes[index] = {
      ...recipes[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveRecipes(recipes);
    return recipes[index];
  }

  /**
   * Deletar receita
   */
  deleteRecipe(id) {
    const recipes = this.getRecipes();
    const filtered = recipes.filter(r => r.id !== id);
    this.saveRecipes(filtered);
    return filtered.length < recipes.length;
  }

  // ==========================================
  // 🏬 MÉTODOS ESPECÍFICOS - INVENTÁRIO/ESTOQUE
  // ==========================================

  /**
   * Obter todo o inventário
   */
  getInventory() {
    return this.get(DB_CONFIG.KEYS.INVENTORY) || [];
  }

  /**
   * Salvar inventário
   */
  saveInventory(inventory) {
    return this.save(DB_CONFIG.KEYS.INVENTORY, inventory);
  }

  /**
   * Obter item específico do inventário
   * @param {string} id - ID do insumo
   * @returns {Object|null} Item ou null
   */
  getInventoryItem(id) {
    const inventory = this.getInventory();
    return inventory.find(item => item.id === id) || null;
  }

  /**
   * Atualizar estoque de um item
   * @param {string} id - ID do insumo
   * @param {number} quantity - Nova quantidade
   * @param {number} cost - Novo custo total (opcional)
   */
  updateStock(id, quantity, cost) {
    const inventory = this.getInventory();
    const index = inventory.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    inventory[index].quantity = parseFloat(quantity);
    
    if (cost !== undefined) {
      inventory[index].cost = parseFloat(cost);
      // Recalcular custo unitário
      inventory[index].costPerUnit = inventory[index].quantity > 0 
        ? inventory[index].cost / inventory[index].quantity 
        : 0;
    }
    
    inventory[index].updatedAt = new Date().toISOString();
    this.saveInventory(inventory);
    return inventory[index];
  }

  /**
   * Ajustar estoque (entrada ou saída)
   * @param {string} id - ID do insumo
   * @param {number} delta - Quantidade a somar (+) ou subtrair (-)
   * @returns {Object|null} Item atualizado ou null se erro
   */
  adjustStock(id, delta) {
    const item = this.getInventoryItem(id);
    if (!item) return null;
    
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 0) {
      console.error(`Estoque insuficiente para ${item.name}`);
      return null;
    }
    
    return this.updateStock(id, newQuantity);
  }

  /**
   * Criar novo item de inventário
   */
  createInventoryItem(item) {
    const inventory = this.getInventory();
    const newItem = {
      id: this.generateId(),
      name: item.name,
      category: item.category || 'Outros',
      unit: item.unit || 'un',
      quantity: parseFloat(item.quantity) || 0,
      minQuantity: parseFloat(item.minQuantity) || 0,
      cost: parseFloat(item.cost) || 0,
      costPerUnit: 0,
      supplier: item.supplier || '',
      notes: item.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Calcular custo unitário
    newItem.costPerUnit = newItem.quantity > 0 ? newItem.cost / newItem.quantity : 0;
    
    inventory.push(newItem);
    this.saveInventory(inventory);
    return newItem;
  }

  /**
   * Atualizar item de inventário
   */
  updateInventoryItem(id, updates) {
    const inventory = this.getInventory();
    const index = inventory.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const updatedItem = {
      ...inventory[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Recalcular custo unitário se custo ou quantidade mudou
    if (updates.cost !== undefined || updates.quantity !== undefined) {
      updatedItem.quantity = parseFloat(updatedItem.quantity);
      updatedItem.cost = parseFloat(updatedItem.cost);
      updatedItem.costPerUnit = updatedItem.quantity > 0 
        ? updatedItem.cost / updatedItem.quantity 
        : 0;
    }
    
    inventory[index] = updatedItem;
    this.saveInventory(inventory);
    return updatedItem;
  }

  /**
   * Deletar item de inventário
   */
  deleteInventoryItem(id) {
    const inventory = this.getInventory();
    const filtered = inventory.filter(item => item.id !== id);
    this.saveInventory(filtered);
    return filtered.length < inventory.length;
  }

  // ==========================================
  // 📋 MÉTODOS ESPECÍFICOS - PEDIDOS
  // ==========================================

  /**
   * Obter todos os pedidos
   */
  getOrders() {
    return this.get(DB_CONFIG.KEYS.ORDERS) || [];
  }

  /**
   * Salvar pedidos
   */
  saveOrders(orders) {
    return this.save(DB_CONFIG.KEYS.ORDERS, orders);
  }

  /**
   * Obter pedido por ID
   */
  getOrder(id) {
    const orders = this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  /**
   * Criar novo pedido
   */
  createOrder(order) {
    const orders = this.getOrders();
    const newOrder = {
      id: this.generateId(),
      clientName: order.clientName || '',
      clientId: order.clientId || null,
      items: order.items || [],
      total: 0,
      status: 'novo',
      observations: order.observations || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Calcular total
    newOrder.total = newOrder.items.reduce((sum, item) => {
      const product = this.getProduct(item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    
    orders.push(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  /**
   * Atualizar pedido
   */
  updateOrder(id, updates) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) return null;
    
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveOrders(orders);
    return orders[index];
  }

  /**
   * Deletar pedido
   */
  deleteOrder(id) {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    this.saveOrders(filtered);
    return filtered.length < orders.length;
  }

  // ==========================================
  // 👥 MÉTODOS ESPECÍFICOS - CLIENTES
  // ==========================================

  /**
   * Obter todos os clientes
   */
  getClients() {
    return this.get(DB_CONFIG.KEYS.CLIENTS) || [];
  }

  /**
   * Salvar clientes
   */
  saveClients(clients) {
    return this.save(DB_CONFIG.KEYS.CLIENTS, clients);
  }

  /**
   * Obter cliente por ID
   */
  getClient(id) {
    const clients = this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  /**
   * Criar novo cliente
   */
  createClient(client) {
    const clients = this.getClients();
    const newClient = {
      id: this.generateId(),
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      neighborhood: client.neighborhood || '',
      city: client.city || '',
      notes: client.notes || '',
      favorite: client.favorite || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    clients.push(newClient);
    this.saveClients(clients);
    return newClient;
  }

  /**
   * Atualizar cliente
   */
  updateClient(id, updates) {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    clients[index] = {
      ...clients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveClients(clients);
    return clients[index];
  }

  /**
   * Deletar cliente
   */
  deleteClient(id) {
    const clients = this.getClients();
    const filtered = clients.filter(c => c.id !== id);
    this.saveClients(filtered);
    return filtered.length < clients.length;
  }

  // ==========================================
  // 💰 MÉTODOS ESPECÍFICOS - FINANÇAS
  // ==========================================

  /**
   * Obter todos os registros financeiros
   */
  getFinance() {
    return this.get(DB_CONFIG.KEYS.FINANCE) || [];
  }

  /**
   * Salvar registros financeiros
   */
  saveFinance(finance) {
    return this.save(DB_CONFIG.KEYS.FINANCE, finance);
  }

  /**
   * Criar registro financeiro
   */
  createFinanceRecord(record) {
    const finance = this.getFinance();
    const newRecord = {
      id: this.generateId(),
      type: record.type, // 'entrada' ou 'saida'
      category: record.category,
      amount: parseFloat(record.amount),
      description: record.description || '',
      relatedId: record.relatedId || null, // ID do pedido relacionado
      createdAt: new Date().toISOString()
    };
    finance.push(newRecord);
    this.saveFinance(finance);
    return newRecord;
  }

  /**
   * Obter resumo financeiro
   */
  getFinanceSummary() {
    const finance = this.getFinance();
    const summary = {
      totalEntradas: 0,
      totalSaidas: 0,
      saldo: 0
    };

    finance.forEach(record => {
      if (record.type === 'entrada') {
        summary.totalEntradas += record.amount;
        summary.saldo += record.amount;
      } else {
        summary.totalSaidas += record.amount;
        summary.saldo -= record.amount;
      }
    });

    return summary;
  }

  // ==========================================
  // 🔗 MÉTODOS DE INTEGRAÇÃO (LIGAÇÃO ENTRE MÓDULOS)
  // ==========================================

  /**
   * Calcular custo de uma receita baseado no estoque atual
   * @param {Object} recipe - Receita a calcular
   * @returns {Object} Detalhes do custo calculado
   */
  calculateRecipeCost(recipe) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return {
        ingredientsCost: 0,
        laborCost: recipe.laborCost || 0,
        totalCost: recipe.laborCost || 0
      };
    }

    let ingredientsCost = 0;
    const ingredientDetails = [];

    recipe.ingredients.forEach(ing => {
      const inventoryItem = this.getInventoryItem(ing.inventoryId);
      
      if (inventoryItem && inventoryItem.quantity > 0) {
        // Custo unitário atual do estoque
        const costPerUnit = inventoryItem.costPerUnit || (inventoryItem.cost / inventoryItem.quantity);
        const ingredientCost = costPerUnit * ing.quantity;
        ingredientsCost += ingredientCost;

        ingredientDetails.push({
          name: inventoryItem.name,
          quantity: ing.quantity,
          unit: inventoryItem.unit,
          costPerUnit: costPerUnit,
          totalCost: ingredientCost
        });
      }
    });

    const laborCost = recipe.laborCost || 0;
    const totalCost = ingredientsCost + laborCost;

    return {
      ingredientsCost,
      laborCost,
      totalCost,
      suggestedPrice: totalCost * (1 + (recipe.margin || 0.5)),
      ingredientDetails
    };
  }

  /**
   * Processar baixa automática de estoque ao finalizar pedido
   * @param {string} orderId - ID do pedido
   * @returns {Object} Resultado da operação
   */
  processOrderCompletion(orderId) {
    const order = this.getOrder(orderId);
    
    if (!order) {
      return { success: false, error: 'Pedido não encontrado' };
    }

    if (order.status !== 'concluido') {
      return { success: false, error: 'Pedido não está concluído' };
    }

    const inventory = this.getInventory();
    const insufficientStock = [];

    // Verificar se há estoque suficiente antes de baixar
    order.items.forEach(orderItem => {
      const product = this.getProduct(orderItem.productId);
      if (!product) return;

      const recipe = this.getRecipe(product.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ing => {
        const totalNeeded = ing.quantity * orderItem.quantity;
        const inventoryItem = inventory.find(i => i.id === ing.inventoryId);

        if (!inventoryItem) {
          insufficientStock.push({
            item: ing.inventoryId,
            name: 'Item não encontrado',
            needed: totalNeeded,
            available: 0
          });
          return;
        }

        if (inventoryItem.quantity < totalNeeded) {
          insufficientStock.push({
            item: ing.inventoryId,
            name: inventoryItem.name,
            needed: totalNeeded,
            available: inventoryItem.quantity
          });
        }
      });
    });

    if (insufficientStock.length > 0) {
      return { 
        success: false, 
        error: 'Estoque insuficiente',
        details: insufficientStock
      };
    }

    // Realizar baixa no estoque
    order.items.forEach(orderItem => {
      const product = this.getProduct(orderItem.productId);
      if (!product) return;

      const recipe = this.getRecipe(product.recipeId);
      if (!recipe) return;

      recipe.ingredients.forEach(ing => {
        const totalNeeded = ing.quantity * orderItem.quantity;
        const index = inventory.findIndex(i => i.id === ing.inventoryId);

        if (index !== -1) {
          inventory[index].quantity -= totalNeeded;
          // Recalcular custo unitário
          inventory[index].costPerUnit = inventory[index].quantity > 0 
            ? inventory[index].cost / inventory[index].quantity 
            : 0;
        }
      });
    });

    this.saveInventory(inventory);

    // Registrar lucro no financeiro
    const totalCost = order.items.reduce((sum, item) => {
      const product = this.getProduct(item.productId);
      const recipe = product ? this.getRecipe(product.recipeId) : null;
      const cost = recipe ? this.calculateRecipeCost(recipe).totalCost : 0;
      return sum + (cost * item.quantity);
    }, 0);

    const profit = order.total - totalCost;

    if (profit > 0) {
      this.createFinanceRecord({
        type: 'entrada',
        category: 'Venda',
        amount: profit,
        description: `Lucro pedido #${orderId.substring(0, 8)}`,
        relatedId: orderId
      });
    }

    return { success: true, message: 'Baixa de estoque realizada com sucesso' };
  }

  /**
   * Obter dados consolidados para o Dashboard
   * @returns {Object} Métricas consolidadas
   */
  getDashboardData() {
    const catalog = this.getCatalog();
    const recipes = this.getRecipes();
    const inventory = this.getInventory();
    const orders = this.getOrders();
    const clients = this.getClients();
    const financeSummary = this.getFinanceSummary();

    // Calcular métricas de pedidos
    const ordersByStatus = {
      novo: orders.filter(o => o.status === 'novo').length,
      producao: orders.filter(o => o.status === 'producao').length,
      pronto: orders.filter(o => o.status === 'pronto').length,
      concluido: orders.filter(o => o.status === 'concluido').length
    };

    const totalRevenue = orders
      .filter(o => o.status === 'concluido')
      .reduce((sum, o) => sum + o.total, 0);

    // Calcular custo total do inventário
    const totalInventoryValue = inventory.reduce((sum, item) => sum + item.cost, 0);

    // Alertas de estoque
    const lowStockItems = inventory.filter(item => 
      item.quantity <= (item.minQuantity || 0) && item.quantity > 0
    );
    
    const criticalStockItems = inventory.filter(item => item.quantity <= 0);

    return {
      catalog: {
        total: catalog.length,
        active: catalog.filter(p => p.status === 'ativo').length
      },
      recipes: {
        total: recipes.length
      },
      inventory: {
        total: inventory.length,
        totalValue: totalInventoryValue,
        lowStock: lowStockItems.length,
        criticalStock: criticalStockItems.length
      },
      orders: {
        total: orders.length,
        byStatus: ordersByStatus,
        totalRevenue
      },
      clients: {
        total: clients.length,
        favorites: clients.filter(c => c.favorite).length
      },
      finance: financeSummary,
      alerts: {
        inventory: {
          lowStock: lowStockItems.map(i => i.name),
          critical: criticalStockItems.map(i => i.name)
        }
      }
    };
  }

  // ==========================================
  // 🔧 UTILITÁRIOS
  // ==========================================

  /**
   * Gerar ID único (timestamp + random)
   * @returns {string}
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Limpar todo o banco (cuidado!)
   */
  clearAll() {
    Object.values(DB_CONFIG.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return { success: true, message: 'Todos os dados foram limpos' };
  }

  /**
   * Exportar todos os dados para backup
   * @returns {Object} Backup completo
   */
  exportBackup() {
    return {
      version: DB_CONFIG.VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        [DB_CONFIG.KEYS.CATALOG]: localStorage.getItem(DB_CONFIG.KEYS.CATALOG),
        [DB_CONFIG.KEYS.RECIPES]: localStorage.getItem(DB_CONFIG.KEYS.RECIPES),
        [DB_CONFIG.KEYS.INVENTORY]: localStorage.getItem(DB_CONFIG.KEYS.INVENTORY),
        [DB_CONFIG.KEYS.ORDERS]: localStorage.getItem(DB_CONFIG.KEYS.ORDERS),
        [DB_CONFIG.KEYS.CLIENTS]: localStorage.getItem(DB_CONFIG.KEYS.CLIENTS),
        [DB_CONFIG.KEYS.FINANCE]: localStorage.getItem(DB_CONFIG.KEYS.FINANCE)
      }
    };
  }

  /**
   * Importar backup
   * @param {Object} backup - Backup a importar
   * @returns {Object} Resultado da importação
   */
  importBackup(backup) {
    if (!backup || !backup.data) {
      return { success: false, error: 'Backup inválido' };
    }

    try {
      Object.entries(backup.data).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });

      return { success: true, message: 'Backup restaurado com sucesso' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Inicializar banco com dados de exemplo se estiver vazio
   */
  initialize() {
    // Se já tem dados, não inicializa
    if (this.has(DB_CONFIG.KEYS.INVENTORY)) return;

    // Dados de exemplo para demonstração
    const sampleInventory = [
      {
        id: 'inv001',
        name: 'Farinha de Trigo',
        category: 'Farináceos',
        unit: 'kg',
        quantity: 10,
        minQuantity: 2,
        cost: 25.00,
        costPerUnit: 2.50,
        supplier: 'Supermercado X',
        notes: 'Marca Dona Benta',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv002',
        name: 'Açúcar Refinado',
        category: 'Açúcares',
        unit: 'kg',
        quantity: 5,
        minQuantity: 1,
        cost: 8.00,
        costPerUnit: 1.60,
        supplier: 'Atacadão Y',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv003',
        name: 'Chocolate Meio Amargo',
        category: 'Chocolate',
        unit: 'kg',
        quantity: 2,
        minQuantity: 0.5,
        cost: 45.00,
        costPerUnit: 22.50,
        supplier: 'Fornecedor Z',
        notes: '50% cacau',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inv004',
        name: 'Ovos (Dúzia)',
        category: 'Ovos',
        unit: 'dz',
        quantity: 10,
        minQuantity: 2,
        cost: 18.00,
        costPerUnit: 1.50,
        supplier: 'Granja W',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.saveInventory(sampleInventory);

    console.log('🏗️ DelikáDB inicializado com dados de exemplo');
  }

  /**
   * Obter estatísticas de uso do storage
   * @returns {Object} Informações sobre o armazenamento
   */
  getStorageInfo() {
    const totalSize = Object.values(DB_CONFIG.KEYS).reduce((sum, key) => {
      const data = localStorage.getItem(key);
      return sum + (data ? data.length * 2 : 0);
    }, 0);

    return {
      usedKB: (totalSize / 1024).toFixed(2),
      usedPercent: Math.min((totalSize / (5 * 1024 * 1024)) * 100, 100),
      totalKeys: Object.values(DB_CONFIG.KEYS).filter(key => this.has(key)).length
    };
  }
}

// ==========================================
// 🚀 INSTÂNCIA GLOBAL DO BANCO
// ==========================================
const DB = new DelikaDB();

// Tornar disponível globalmente para uso em todos os módulos
if (typeof window !== 'undefined') {
  window.DB = DB;
  window.DB_CONFIG = DB_CONFIG;
}
