# -*- coding: utf-8 -*-
from pathlib import Path

print("=" * 60)
print("CORRECAO COMPLETA - TODOS OS PADROES")
print("=" * 60)

# Todos os padroes de UTF-8 duplicado conhecidos
fixes = [
    # a
    (b'\xc3\x83\xc2\xa1', 'á'),
    # ã
    (b'\xc3\x83\xc2\xa3', 'ã'),
    # é
    (b'\xc3\x83\xc2\xa9', 'é'),
    # í
    (b'\xc3\x83\xc2\xad', 'í'),
    # ó
    (b'\xc3\x83\xc2\xb3', 'ó'),
    # ú
    (b'\xc3\x83\xc2\xba', 'ú'),
    # ç
    (b'\xc3\x83\xc2\xa7', 'ç'),
    # â
    (b'\xc3\x83\xc2\xa2', 'â'),
    # ê
    (b'\xc3\x83\xc2\xaa', 'ê'),
    # ô
    (b'\xc3\x83\xc2\xb4', 'ô'),
    # à
    (b'\xc3\x83\xc2\xa0', 'à'),
    # ü
    (b'\xc3\x83\xc2\xbc', 'ü'),
    # õ
    (b'\xc3\x83\xc2\xb5', 'õ'),
    # Á
    (b'\xc3\x83\xc2\x81', 'Á'),
    # Ã
    (b'\xc3\x83\xc2\x83', 'Ã'),
    # É
    (b'\xc3\x83\xc2\x89', 'É'),
    # Í
    (b'\xc3\x83\xc2\x8d', 'Í'),
    # Ó
    (b'\xc3\x83\xc2\x93', 'Ó'),
    # Ú
    (b'\xc3\x83\xc2\x9a', 'Ú'),
    # Ç
    (b'\xc3\x83\xc2\x87', 'Ç'),
    # Õ
    (b'\xc3\x83\xc2\x95', 'Õ'),
]

html_files = list(Path('.').rglob('*.html'))
contador = 0

for html_file in html_files:
    try:
        content = html_file.read_bytes()
        original = content
        
        for bad_seq, correct_char in fixes:
            content = content.replace(bad_seq, correct_char.encode('utf-8'))
        
        if content != original:
            html_file.write_bytes(content)
            contador += 1
            print(f"[{contador}] Corrigido: {html_file}")
    except Exception as e:
        print(f"Erro: {e}")

print(f"\nTotal: {contador} arquivos")

# Verificacao final
problemas = 0
for html_file in html_files:
    content = html_file.read_bytes()
    if b'\xc3\x83\xc2' in content:
        problemas += 1
        print(f"Problema: {html_file}")

if problemas == 0:
    print("SUCESSO! Todos corrigidos!")
else:
    print(f"Resta: {problemas} arquivos")