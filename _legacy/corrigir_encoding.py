#!/usr/bin/env python3
"""
Script para corrigir encoding UTF-8 corrompido em arquivos HTML
Converte caracteres mojibake (Ã§, Ã£, Ã©, etc) para a forma correta
"""

import re

def corrigir_encoding(text):
    """Corrige caracteres portugueses corrompidos"""
    
    # Mapa de correções para caracteres portugueses
    correcoes = {
        # Vogais acentuadas
        r'Ã¡': 'á', r'Ã£': 'ã', r'Ã¢': 'â', r'Ã©': 'é', r'Ãª': 'ê',
        r'Ã': 'í', r'Ã®': 'î', r'Ã³': 'ó', r'Ãµ': 'õ', r'Ã´': 'ô',
        r'Ãº': 'ú', r'Ã»': 'û', r'Ã¨': 'è', r'Ã¬': 'ì', r'Ã²': 'ò',
        r'Ã¹': 'ù',
        
        # Consoantes especiais
        r'Ã§': 'ç', r'Ã°': 'ð', r'Ã½': 'ý', r'Ã¾': 'þ',
        
        # Caracteres especiais
        r'â€¢': '•', r'â€"': '—', r'â€“': '–', r'â€˜': '‘',
        r'â€™': '’', r'â€œ': '“', r'â€': '”', r'â€¦': '…',
        r'Ã‰': 'É', r'Ãƒ': 'Ã', r'â€¡': 'ç',
        
        # Casos específicos encontrados
        r'CardÃ¡pio': 'Cardápio', r'DelikÃ¡': 'Deliká',
        r'Embu-GuaÃ§u': 'Embu-Guaçu', r'opÃ§Ãµes': 'opções',
        r'artesanais': 'artesanais', r'confeitaria': 'confeitaria',
        r'momentos especiais': 'momentos especiais',
        r'TradiÃ§Ã£o': 'Tradição', r'sabor em cada fatia': 'sabor em cada fatia',
        r'Seg a SÃ¡b': 'Seg a Sáb', r'09h Ã s 18h': '09h às 18h',
        r'JacarandÃ¡s': 'Jacarandás', r'avaliaÃ§Ãµes': 'avaliações',
        r'satisfaÃ§Ã£o': 'satisfação', r'estÃ¡': 'está',
        r'PrÃ©via': 'Prévia', r'VulcÃ£o': 'Vulcão',
        r'PrestÃ­gio': 'Prestígio', r'LimÃ£o': 'Limão',
        r'MaracujÃ¡': 'Maracujá', r'MaÃ§Ã£': 'Maçã',
        r'AÃ§Ãºcar': 'Açúcar', r'Arco-Ãris': 'Arco-Íris',
        r'Ãcone': 'Ícone', r'Verificar Carrinho': 'Verificar Carrinho'
    }
    
    # Aplicar correções
    for incorreto, correto in correcoes.items():
        text = re.sub(incorreto, correto, text)
    
    return text

def main():
    # Ler o arquivo cardapio.html
    with open('cardapio.html', 'r', encoding='utf-8') as f:
        conteudo = f.read()
    
    # Corrigir encoding
    conteudo_corrigido = corrigir_encoding(conteudo)
    
    # Salvar arquivo corrigido
    with open('cardapio.html', 'w', encoding='utf-8') as f:
        f.write(conteudo_corrigido)
    
    print("✅ Encoding corrigido com sucesso!")

if __name__ == "__main__":
    main()