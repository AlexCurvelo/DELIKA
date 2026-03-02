# 📸 Guia de Upload de Imagens - Deliká

## ⚠️ IMPORTANTE: Sistema de Otimização Automática

Todas as novas imagens são **automaticamente convertidas para WebP** para melhor performance.

## 📁 Processo de Upload:

### Opção 1: Upload Normal (Recomendado)
1. Faça upload da imagem na pasta `img/`
2. **Aguarde 2-3 segundos** - o sistema converterá automaticamente para WebP
3. Use a versão `.webp` no seu HTML

### Opção 2: Upload com Nome Específico
```html
<!-- No seu HTML, sempre referencie a versão .webp -->
<img src="img/nome-da-imagem.webp" alt="Descrição" loading="lazy">
```

## 🎯 Formatos Suportados:
- ✅ JPG/JPEG → convertido para WebP
- ✅ PNG → convertido para WebP  
- ✅ WebP → mantido como está

## ⚡ Melhores Práticas:

### ✔️ FAÇA:
- Nomes descritivos: `bolo-chocolate-morango.jpg`
- Tamanho razoável: max 5MB por imagem
- Use WebP no HTML: `src="img/nome.webp"`

### ❌ NÃO FAÇA:
- Nomes genéricos: `IMG_1234.jpg`
- Imagens muito pesadas: >10MB
- Esquecer de usar `.webp` no HTML

## 🔧 Scripts Disponíveis:

### Otimização Manual:
```powershell
.\scripts\optimize-images.ps1
```

### Monitoramento Automático:
```powershell
.\scripts\auto-optimize.ps1
```

## 📞 Suporte:
Em caso de problemas com otimização, execute:
```powershell
.\scripts\optimize-images.ps1 -Quality 90
```

---

**Última atualização**: 1º de Março de 2026  
**Sistema**: Auto-Optimização WebP Deliká v1.0