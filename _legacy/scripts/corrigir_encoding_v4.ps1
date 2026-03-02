<#
.SYNOPSIS
Correção de encoding com corrupção dupla (UTF-8 -> Windows-1252 -> UTF-8)
#>

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "CORREÇÃO DEFINITIVA - ENCODING DUPLO" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Mapeamento de correção dupla
# Exemplo: ÃƒÂ¡ = á (duplamente corrompido)
$correcoes = @{
    # Acentos agudos
    "ÃƒÂ¡" = "á"
    "ÃƒÂ©" = "é"
    "ÃƒÂ­" = "í"
    "ÃƒÂ³" = "ó"
    "ÃƒÂº" = "ú"
    "ÃƒÂ" = "Á"
    "ÃƒÂ‰" = "É"
    "ÃƒÂ" = "Í"
    "ÃƒÂ" = "Ó"
    "ÃƒÂš" = "Ú"
    
    # Acentos circunflexos
    "ÃƒÂ¢" = "â"
    "ÃƒÂª" = "ê"
    "ÃƒÂ" = "Â"
    "ÃƒÂ" = "Ê"
    "ÃƒÂ´" = "ô"
    "ÃƒÂ" = "Ô"
    
    # Crase
    "ÃƒÂ " = "à"
    "ÃƒÂ " = "À"
    
    # Til
    "ÃƒÂ£" = "ã"
    "ÃƒÂµ" = "õ"
    "ÃƒÂ" = "Ã"
    "ÃƒÂ" = "Õ"
    
    # Cedilha
    "ÃƒÂ§" = "ç"
    "ÃƒÂ" = "Ç"
    
    # Trema
    "ÃƒÂ¼" = "ü"
    "ÃƒÂ" = "Ü"
    
    # Corrupção simples (versão anterior)
    "DelikÃ¡" = "Deliká"
    "Embu-GuaÃ§u" = "Embu-Guaçu"
    "CardÃ¡pio" = "Cardápio"
    "OtimizaÃ§Ãµes" = "Otimizações"
    "confeitaria artesanal em Embu-GuaÃ§u" = "confeitaria artesanal em Embu-Guaçu"
}

$contador = 0

Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Encoding UTF8 -Raw
    
    $original = $content
    
    foreach ($key in $correcoes.Keys) {
        $content = $content -replace [regex]::Escape($key), $correcoes[$key]
    }
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        $contador++
        Write-Host "[$contador] Corrigido: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "Arquivos corrigidos: $contador" -ForegroundColor Yellow

# Verificação
Write-Host "`nVerificando caracteres residuais..." -ForegroundColor Yellow
$resultado = Get-ChildItem -Recurse -Filter *.html | Select-String -Pattern "Ã" | Group-Object Path

if ($resultado) {
    Write-Host "Ainda encontrados em $($resultado.Count) arquivos" -ForegroundColor Red
} else {
    Write-Host "✅ TODOS OS CARACTERES CORRIGIDOS!" -ForegroundColor Green
}