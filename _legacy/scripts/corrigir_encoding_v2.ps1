<#
.SYNOPSIS
Versão 2 - Corrige encoding UTF-8 em arquivos HTML com Mojibake

.DESCRIPTION
Substitui caracteres corrompidos por suas formas corretas com mapeamento mais abrangente
#>

# Mapeamento completo de correções
$correcoes = @{
    "Ã¡" = "á"
    "Ã " = "à"  
    "Ã£" = "ã"
    "Ã¢" = "â"
    "Ã¤" = "ä"
    "Ã©" = "é"
    "Ã¨" = "è"
    "Ãª" = "ê"
    "Ã«" = "ë"
    "Ã³" = "ó"
    "Ã²" = "ò"
    "Ãµ" = "õ"
    "Ã" = "ô"
    "Ã¶" = "ö"
    "Ã§" = "ç"
    "Ãº" = "ú"
    "Ã¹" = "ù"
    "Ã»" = "û"
    "Ã¼" = "ü"
    "Ã±" = "ñ"
    "Â°" = "°"
    "Âª" = "ª"
    "Âº" = "º"
}

# Processar arquivos HTML
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content -Path $filePath -Encoding UTF8 -Raw
    
    # Aplicar correções
    foreach ($key in $correcoes.Keys) {
        $content = $content -replace $key, $correcoes[$key]
    }
    
    # Salvar arquivo corrigido
    Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Arquivo corrigido: $filePath" -ForegroundColor Green
}

Write-Host "`n✅ TODOS OS ARQUIVOS FORAM CORRIGIDOS (V2)" -ForegroundColor Cyan