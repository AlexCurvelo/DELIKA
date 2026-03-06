/**
 * ═══════════════════════════════════════════════════════════════════
 * ADM Deliká - Database Manager v1.0
 * Arquiteto: Alexandre Curvelo
 * Paradigma: Local-First (Zero-Server)
 * ═══════════════════════════════════════════════════════════════════
 */

const DB_CONFIG = {
  // Storage Keys
  KEYS: {
    CATALOG: 'delika_catalog_v5',
    RECIPES: 'delika_recipes_v5',
    INVENTORY: 'delika_inventory_v5',
    ORDERS: 'pedidosDelika',
    FINANCE: 'delika_cashflow_v1',
    CUSTOMERS: 'delika_crm_v5',
    CONFIG: 'delika_config_v1'
  },

  // Measurement Conversions (to grams)
  CONVERSIONS: {
    'kg': 1000,
    'g': 1,
    'l': 1000,
    'ml': 1,
    'colher_sopa': 15,
    'colher_cha': 5,
    'xicara': 240,
    'unidade': 1,
    'pitada': 2,
    'pacote': 1000
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * Database Manager Class
 * ═══════════════════════════════════════════════════════════════════
 */
class Database {
  constructor() {
    this.catalog = this.load(DB_CONFIG.KEYS.CATALOG);
    this.recipes = this.load(DB_CONFIG.KEYS.RECIPES);
    this.inventory = this.load(DB_CONFIG.KEYS.INVENTORY);
    this.orders = this.load(DB_CONFIG.KEYS.ORDERS);
    this.finance = this.load(DB_CONFIG.KEYS.FINANCE);
    this.customers = this.load(DB_CONFIG.KEYS.CUSTOMERS);
  }

  // Generic methods
  load(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Generate ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // CRUD - Catalog (Products)
  addProduct(product) {
    const newProduct = {
      id: this.generateId(),
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.catalog.push(newProduct);
    this.save(DB_CONFIG.KEYS.CATALOG, this.catalog);
    return newProduct;
  }

  updateProduct(id, updates) {
    const index = this.catalog.findIndex(p => p.id === id);
    if (index !== -1) {
      this.catalog[index] = {
        ...this.catalog[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save(DB_CONFIG.KEYS.CATALOG, this.catalog);
      return this.catalog[index];
    }
    return null;
  }

  deleteProduct(id) {
    this.catalog = this.catalog.filter(p => p.id !== id);
    this.save(DB_CONFIG.KEYS.CATALOG, this.catalog);
  }

  getProduct(id) {
    return this.catalog.find(p => p.id === id);
  }

  getActiveProducts() {
    return this.catalog.filter(p => p.status === 'ativo');
  }

  getVisibleProducts() {
    return this.catalog.filter(p => p.visible === true && p.status === 'ativo');
  }

  // CRUD - Inventory (Supplies)
  addSupply(supply) {
    const newSupply = {
      id: this.generateId(),
      ...supply,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.inventory.push(newSupply);
    this.save(DB_CONFIG.KEYS.INVENTORY, this.inventory);
    return newSupply;
  }

  updateSupply(id, updates) {
    const index = this.inventory.findIndex(i => i.id === id);
    if (index !== -1) {
      this.inventory[index] = {
        ...this.inventory[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save(DB_CONFIG.KEYS.INVENTORY, this.inventory);
      return this.inventory[index];
    }
    return null;
  }

  deleteSupply(id) {
    this.inventory = this.inventory.filter(i => i.id !== id);
    this.save(DB_CONFIG.KEYS.INVENTORY, this.inventory);
  }

  getSupply(id) {
    return this.inventory.find(i => i.id === id);
  }

  // CRUD - Recipes
  addRecipe(recipe) {
    const newRecipe = {
      id: this.generateId(),
      ...recipe,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.recipes.push(newRecipe);
    this.save(DB_CONFIG.KEYS.RECIPES, this.recipes);
    return newRecipe;
  }

  updateRecipe(id, updates) {
    const index = this.recipes.findIndex(r => r.id === id);
    if (index !== -1) {
      this.recipes[index] = {
        ...this.recipes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save(DB_CONFIG.KEYS.RECIPES, this.recipes);
      return this.recipes[index];
    }
    return null;
  }

  deleteRecipe(id) {
    this.recipes = this.recipes.filter(r => r.id !== id);
    this.save(DB_CONFIG.KEYS.RECIPES, this.recipes);
  }

  getRecipeByProduct(productName) {
    return this.recipes.find(r => r.productName === productName);
  }

  // Cost Calculation
  calculateRecipeCost(recipeId) {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) return 0;

    let totalCost = 0;

    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach(ing => {
        const supply = this.inventory.find(i => i.id === ing.supplyId);
        if (supply) {
          const factor = DB_CONFIG.CONVERSIONS[ing.unit] || 1;
          totalCost += (supply.price / supply.quantity) * (ing.quantity * factor);
        }
      });
    }

    return totalCost;
  }

  // Suggested Price Calculation
  calculateSuggestedPrice(recipeId, profitMargin = 50) {
    const cost = this.calculateRecipeCost(recipeId);
    const laborCost = cost * 0.3; // 30% of cost for labor
    return (cost + laborCost) * (1 + profitMargin / 100);
  }

  // Orders Management
  addOrder(order) {
    const newOrder = {
      id: this.generateId(),
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.orders.push(newOrder);
    this.save(DB_CONFIG.KEYS.ORDERS, this.orders);
    return newOrder;
  }

  updateOrderStatus(id, status) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index] = {
        ...this.orders[index],
        status,
        updatedAt: new Date().toISOString()
      };
      this.save(DB_CONFIG.KEYS.ORDERS, this.orders);
      return this.orders[index];
    }
    return null;
  }

  // Automatic Stock Reduction
  processOrderCompletion(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || order.status === 'concluido') return false;

    // Get recipe
    const recipe = this.recipes.find(r => r.productName === order.productName);
    if (!recipe || !recipe.ingredients) return false;

    // Deduct from inventory
    recipe.ingredients.forEach(ing => {
      const supply = this.inventory.find(i => i.id === ing.supplyId);
      if (supply) {
        const factor = DB_CONFIG.CONVERSIONS[ing.unit] || 1;
        const usedQuantity = ing.quantity * factor * order.quantity;
        supply.quantity = Math.max(0, supply.quantity - usedQuantity);
      }
    });

    this.save(DB_CONFIG.KEYS.INVENTORY, this.inventory);

    // Update order status
    this.updateOrderStatus(orderId, 'concluido');

    // Calculate profit and save to finance
    const cost = this.calculateRecipeCost(recipe.id);
    const profit = order.totalValue - cost;
    this.recordTransaction({
      type: 'income',
      orderId: orderId,
      amount: order.totalValue,
      cost: cost,
      profit: profit,
      date: new Date().toISOString()
    });

    return true;
  }

  // Finance
  recordTransaction(transaction) {
    this.finance.push({
      id: this.generateId(),
      ...transaction,
      createdAt: new Date().toISOString()
    });
    this.save(DB_CONFIG.KEYS.FINANCE, this.finance);
  }

  getFinanceSummary() {
    const income = this.finance.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const costs = this.finance.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.cost || 0), 0);
    const profit = this.finance.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.profit || 0), 0);

    return { income, costs, profit };
  }

  // Seed Data (for testing)
  seedTestData() {
    // Test products
    if (this.catalog.length === 0) {
      this.catalog = [
        {
          id: this.generateId(),
          name: 'Bolo de Chocolate',
          description: 'Bolo de chocolate belga com ganache',
          price: 85.00,
          image: '../assets/images/logodlk.webp',
          category: 'bolos',
          status: 'ativo',
          visible: true,
          featured: false,
          createdAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          name: 'Bolo Red Velvet',
          description: 'Massa avermelhada com cream cheese',
          price: 78.00,
          image: '../assets/images/logodlk.webp',
          category: 'bolos',
          status: 'ativo',
          visible: true,
          featured: true,
          createdAt: new Date().toISOString()
        }
      ];
      this.save(DB_CONFIG.KEYS.CATALOG, this.catalog);
    }

    // Test inventory
    if (this.inventory.length === 0) {
      this.inventory = [
        { id: this.generateId(), name: 'Farinha de Trigo', quantity: 5000, unit: 'g', price: 15.00, category: 'farinceos', createdAt: new Date().toISOString() },
        { id: this.generateId(), name: 'Açúcar', quantity: 3000, unit: 'g', price: 12.00, category: 'açucares', createdAt: new Date().toISOString() },
        { id: this.generateId(), name: 'Chocolate Belga', quantity: 1000, unit: 'g', price: 45.00, category: 'chocolates', createdAt: new Date().toISOString() },
        { id: this.generateId(), name: 'Ovos (dz)', quantity: 50, unit: 'unidade', price: 18.00, category: 'ovos', createdAt: new Date().toISOString() },
        { id: this.generateId(), name: 'Leite', quantity: 6000, unit: 'ml', price: 8.00, category: 'laticinios', createdAt: new Date().toISOString() }
      ];
      this.save(DB_CONFIG.KEYS.INVENTORY, this.inventory);
    }
  }
}

// Global instance
window.db = new Database();
