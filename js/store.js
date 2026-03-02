/**
 * Deliká Store - Sistema Centralizado de Dados
 * Abstração para localStorage com suporte a migração futura para Cloud
 */

class DelikaStore {
  constructor() {
    this.prefix = 'delika_';
    this.version = 'v2.0';
  }

  /**
   * Salvar dados em uma coleção
   * @param {string} collection - Nome da coleção
   * @param {any} data - Dados a serem salvos
   * @returns {Promise<any>} Dados salvos
   */
  async save(collection, data) {
    const key = this.prefix + collection;
    const validated = this.validateData(data);
    const payload = {
      data: validated,
      timestamp: Date.now(),
      version: this.version
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return validated;
  }

  /**
   * Obter dados de uma coleção
   * @param {string} collection - Nome da coleção
   * @returns {Promise<any|null>} Dados ou null
   */
  async get(collection) {
    const key = this.prefix + collection;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    try {
      const parsed = JSON.parse(raw);
      return parsed.data || parsed;
    } catch (e) {
      console.warn('Erro ao ler dados:', e);
      return null;
    }
  }

  /**
   * Remover dados de uma coleção
   * @param {string} collection - Nome da coleção
   */
  async remove(collection) {
    const key = this.prefix + collection;
    localStorage.removeItem(key);
  }

  /**
   * Validar e sanitizar dados
   * @param {any} data - Dados a validar
   * @returns {any} Dados sanitizados
   */
  validateData(data) {
    if (typeof data === 'string') {
      // Normalizar Unicode e remover acentos危险字符
      return data.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    if (Array.isArray(data)) {
      return data.map(item => this.validateData(item));
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const key in data) {
        sanitized[key] = this.validateData(data[key]);
      }
      return sanitized;
    }
    return data;
  }

  /**
   * Obter todos os produtos do cardápio
   * @returns {Promise<Array>} Lista de produtos
   */
  async getProdutos() {
    return await this.get('produtos') || this.getProdutosDefault();
  }

  /**
   * Produtos padrão (fallback)
   */
  getProdutosDefault() {
    return [
      { id: 'bolo-fuba', nome: 'Fubá com Goiabada', preco: 27.00, categoria: 'bolos-simples' },
      { id: 'bolo-milho', nome: 'Milho Verde', preco: 27.00, categoria: 'bolos-simples' },
      { id: 'bolo-laranja', nome: 'Laranja', preco: 27.00, categoria: 'bolos-simples' }
    ];
  }

  /**
   * Obter pedidos do cliente
   * @returns {Promise<Array>} Lista de pedidos
   */
  async getPedidos() {
    return await this.get('pedidos') || [];
  }

  /**
   * Salvar novo pedido
   * @param {Object} pedido - Dados do pedido
   */
  async salvarPedido(pedido) {
    const pedidos = await this.getPedidos();
    pedido.id = Date.now();
    pedido.status = 'pendente';
    pedido.data = new Date().toISOString();
    pedidos.push(pedido);
    await this.save('pedidos', pedidos);
    return pedido;
  }
}

// Instância global
window.DelikaDB = new DelikaStore();

// Compatibilidade com código existente
window.DelikaAPI = {
  saveOrder: (data) => DelikaDB.salvarPedido(data),
  getOrders: () => DelikaDB.getPedidos(),
  getProdutos: () => DelikaDB.getProdutos()
};