# 🏆 Manual do Arquiteto: Deliká v2.0 - The Clean Path

## 🛡️ FASE 1: Higiene e Ambiente (Prevenção de Bugs)

### Configuração de Encoding (.vscode/settings.json)
```json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false,
  "files.eol": "\n",
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}
```

### Git Flow Estruturado
```
# Setup inicial
git init
git add .
git commit -m "🎉 Init: Base limpa Deliká v2.0"

# Convenção de commits
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração sem mudança de comportamento
docs: documentação
style: formatação (espaços, vírgulas)
```

### Design Tokens (css/variables.css)
```css
:root {
  /* Cores principais */
  --roxo-delika: #6B2D8C;
  --roxo-escuro: #4A1C61;
  --lilas-claro: #E6D4F0;
  --dourado: #FFD700;
  
  /* Sistema de cores */
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
  
  /* Tipografia */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Urbanist', sans-serif;
  
  /* Espaçamentos */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}
```

## 🗄️ FASE 2: Arquitetura de Dados (O Cérebro)

### Estrutura de Store Centralizada (js/store.js)
```javascript
// Abstração de armazenamento
class DelikaStore {
  constructor() {
    this.version = 'v2.0';
  }

  // Interface única para dados
  async save(collection, data) {
    const key = `delika_${collection}`;
    const validated = this.validateData(data);
    localStorage.setItem(key, JSON.stringify(validated));
    return validated;
  }

  async get(collection) {
    const key = `delika_${collection}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  validateData(data) {
    // Sanitização básica
    if (typeof data === 'string') {
      return data.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return data;
  }
}

// Instância global
window.DelikaDB = new DelikaStore();
```

### Schema de Dados
```javascript
// Produto schema
const produtoSchema = {
  id: Date.now(), // ID único
  nome: '',
  preco: 0,
  categoria: '',
  descricao: '',
  imagem: '', // Referência para assets/
  ativo: true
};

// Pedido schema  
const pedidoSchema = {
  id: Date.now(),
  cliente: {
    nome: '',
    telefone: '',
    endereco: ''
  },
  itens: [],
  total: 0,
  status: 'pendente' // pendente, confirmado, entregue
};
```

## 🎨 FASE 3: UI/UX Componentizada (Os Músculos)

### Estrutura de Arquivos CSS
```
css/
├── variables.css    # Design tokens
├── reset.css        # Reset consistente
├── layout.css       # Grid sistema
├── components.css   # Botões, cards, modais
└── utilities.css    # Classes utilitárias
```

### Princípios Mobile-First
```css
/* Layout responsivo base */
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.grid-2col {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .grid-2col {
    grid-template-columns: 1fr 1fr;
  }
}
```

### Otimização de Assets
```
assets/
├── images/          # .webp apenas
├── icons/           # .svg apenas  
└── fonts/           # Web fonts otimizadas
```

## 🔐 FASE 4: Segurança e Transição (O Legado)

### Sistema de Autenticação (js/auth.js)
```javascript
class AuthMiddleware {
  static isAuthenticated() {
    const token = localStorage.getItem('delika_admin_token');
    return !!token;
  }

  static protectRoute() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }
}

// Uso nas páginas administrativas
if (!AuthMiddleware.protectRoute()) {
  // Redirecionamento automático
}
```

### Camada de API Abstrata
```javascript
// js/api.js - Interface única para dados
class DelikaAPI {
  // Local storage implementation (v1)
  async saveOrder(orderData) {
    return DelikaDB.save('pedidos', orderData);
  }

  // Future Firebase implementation (v2)
  async saveOrderFirebase(orderData) {
    // Implementação futura
    console.log('Migrando para Firebase...');
  }
}
```

## 📅 Plano de Entrega em Sprints

### Sprint 1: Fundação (1 semana)
- [ ] Configuração de ambiente (.vscode, git)
- [ ] Design tokens e reset CSS
- [ ] Sistema de store centralizado
- [ ] Schema de dados definido

### Sprint 2: Lógica Core (2 semanas)  
- [ ] Sistema de autenticação
- [ ] CRUD de produtos
- [ ] CRUD de pedidos
- [ ] Validação de dados

### Sprint 3: UI/UX (2 semanas)
- [ ] Componentes base (header, footer, cards)
- [ ] Páginas responsivas
- [ ] Sistema de grid
- [ ] Animações e feedback visual

### Sprint 4: Deploy e Otimização (1 semana)
- [ ] Compressão de assets
- [ ] PWA setup
- [ ] Performance testing
- [ ] Deploy em produção

## 📊 Métricas de Qualidade

- **Performance**: Lighthouse Score > 90
- **SEO**: Meta tags completas e estrutura semântica
- **Acessibilidade**: WCAG AA compliant
- **Manutenibilidade**: Baixo acoplamento, alta coesão

## 🚨 Checklist de Go-Live

- [ ] Encoding UTF-8 verificado
- [ ] Assets otimizados (WebP/SVG)
- [ ] Testes cross-browser
- [ ] Documentação completa
- [ ] Backup do sistema anterior

---

*"A inteligência é o que nos permite ver as coisas como elas são, não como gostaríamos que fossem." - Marco Aurélio*
