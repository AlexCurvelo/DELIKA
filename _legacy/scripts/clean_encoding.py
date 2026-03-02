# -*- coding: utf-8 -*-
import os
import re
from pathlib import Path

print("=" * 50)
print("CORRECAO DE ENCODING - PYTHON")
print("=" * 50)

# Correcoes em bytes UTF-8
correcoes = [
    (b'\xc3\xa1', 'á'),
    (b'\xc3\xa3', 'ã'),
    (b'\xc3\xa9', 'é'),
    (b'\xc3\xad', 'í'),
    (b'\xc3\xb3', 'ó'),
    (b'\xc3\xba', 'ú'),
    (b'\xc3\xa7', 'ç'),
    (b'\xc3\xa2', 'â'),
    (b'\xc3\xaa', 'ê'),
    (b'\xc3\xb4', 'ô'),
    (b'\xc3\xa0', 'à'),
    (b'\xc3\xbc', 'ü'),
    (b'\xc3\x81', 'Á'),
    (b'\xc3\x83', 'Ã'),
    (b'\xc3\x89', 'É'),
    (b'\xc3\x8d', 'Í'),
    (b'\xc3\x93', 'Ó'),
    (b'\xc3\x9a', 'Ú'),
    (b'\xc3\x87', 'Ç'),
]

html_files = list(Path('.').rglob('*.html'))
contador = 0

for html_file in html_files:
    try:
        # Ler como bytes
        content_bytes = html_file.read_bytes()
        original = content_bytes
        
        # Aplicar correcoes
        for old, new in correcoes:
            content_bytes = content_bytes.replace(old, new.encode('utf-8'))
        
        # Se mudou, salvar
        if content_bytes != original:
            html_file.write_bytes(content_bytes)
            contador += 1
            print(f"[{contador}] Corrigido: {html_file}")
    except Exception as e:
        print(f"Erro em {html_file}: {e}")

print(f"\nTotal de arquivos corrigidos: {contador}")
print("VERIFICANDO RESULTADOS...")

# Verificar se ainda ha problemas
problemas = 0
for html_file in html_files:
    content = html_file.read_text(encoding='utf-8', errors='ignore')
    if 'Delik' in content and ('Ã' in content or 'â€' in content):
        problemas += 1
        print(f"Problema: {html_file}")

if problemas == 0:
    print("TODOS OS ARQUIVOS FORAM CORRIGIDOS!")
else:
    print(f"Ainda ha {problemas} arquivos com problemas")