<#
.SYNOPSIS
Versão 3 - Correção direcionada de encoding UTF-8
#>

# Padrões específicos encontrados
$padroes = @{
    "DelikÃ¡" = "Deliká"
    "Embu-GuaÃ§u" = "Embu-Guaçu"
    "CardÃ¡pio" = "Cardápio"
    "Confeitaria artesanal em Embu-GuaÃ§u" = "Confeitaria artesanal em Embu-Guaçu"
    "Karina, DelikÃ¡" = "Karina, Deliká"
    "OtimizaÃ§Ã£o" = "Otimização"
}

Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Encoding UTF8 -Raw
    
    foreach ($key in $padroes.Keys) {
        $content = $content -replace $key, $padroes[$key]
    }
    
    Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Arquivo processado: $($_.Name)" -ForegroundColor Green
}

Write-Host "`n✅ CORREÇÃO DIRECIONADA CONCLUÍDA" -ForegroundColor Cyan