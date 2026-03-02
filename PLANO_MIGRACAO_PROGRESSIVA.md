# 🔄 Plano de Migração Progressiva Deliká v1 → v2

## 📌 Princípios Orientadores
1. **Não quebrar o que funciona** - Manter o site no ar durante a transição
2. **Reutilização inteligente** - Aproveitar assets e HTML existentes
3. **Incrementabilidade** - Cada melhoria deve ser independente e testável

## 🔧 Fase 0: Preparação do Ambiente
1. **Configuração UTF-8** (imediato)
   ```powershell
   # Criar diretório .vscode se não existir
   if (!(Test-Path ".vscode")) { New-Item -ItemType Directory -Path ".vscode" }
   
   # Criar settings.json
   @'
   {
     "files.encoding": "utf8",
     "files.autoGuessEncoding": false
   }
   '@ | Out-File -FilePath ".vscode/settings.json" -Encoding utf8
   ```

2. **Estrutura Híbrida** (pastas)
   ```
   siteDLK/
   ├── _legacy/           # Código atual (será migrado progressivamente)
   ├── assets/            # Novos assets (WebP/SVG)
   ├── css/               # Novo CSS modular
   └── js/                # Novos módulos (store.js, auth.js)
   ```

## 🧩 Fase 1: Componentes Reutilizáveis
1. **Header/Footer** - Manter HTML, atualizar CSS para usar variáveis
   ```html
   <!-- _legacy/partials/header.html -->
   <header style="background: var(--roxo-delika)">
     <!-- Conteúdo atual -->
   </header>
   ```

2. **Cards de Produto** - Extrair para componente
   ```javascript
   // js/components/product-card.js
   class ProductCard extends HTMLElement {
     constructor() {
       super();
       this.innerHTML = `
         <div class="card" style="border-color: var(--dourado)">
           <!-- Template baseado no card atual -->
         </div>
       `;
     }
   }
   customElements.define('product-card', ProductCard);
   ```

## 🗃️ Fase 2: Migração de Dados
1. **Adapter Pattern** para dados existentes
   ```javascript
   // js/adapters/legacy-data.js
   export function convertLegacyProduct(legacyItem) {
     return {
       id: legacyItem.id || Date.now(),
       nome: legacyItem.nome.normalize('NFD'),
       preco: parseFloat(legacyItem.preco),
       // ... outros campos
     };
   }
   ```

2. **Carregamento Híbrido**
   ```javascript
   // Carrega dados novos ou fallback para legado
   async function loadProducts() {
     try {
       const products = await DelikaDB.get('produtos');
       return products || convertLegacyProducts(window.legacyProducts);
     } catch (e) {
       console.warn('Usando dados legados', e);
       return convertLegacyProducts(window.legacyProducts);
     }
   }
   ```

## 🚦 Fase 3: Roteamento Progressivo
1. **Sistema de Feature Flags**
   ```javascript
   // js/config.js
   export const FEATURES = {
     NEW_STORE: false,  // Alternar entre localStorage e novo store
     WEBP_IMAGES: true  // Usar novos assets quando disponível
   };
   ```

2. **Migração Página por Página**
   ```
   1. cardapio.html     (prioridade máxima)
   2. index.html
   3. adm/pedidos.html
   ```

## 📅 Cronograma Estimado
| Fase | Duração | Tarefas-Chave |
|------|---------|---------------|
| Preparação | 1 dia | Ambiente, Estrutura |
| Componentes | 3 dias | Header, Footer, Cards |
| Dados | 5 dias | Adaptadores, Migração |
| Testes | 2 dias | Validação cruzada |

💡 **Dica**: Execute `npm run serve` para ter um servidor local com hot-reload durante a migração.