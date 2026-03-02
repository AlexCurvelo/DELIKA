<#
.SYNOPSIS
Limpeza final de encoding - abordagem simplificada
#>

Write-Host "INICIANDO LIMPEZA FINAL..." -ForegroundColor Cyan

# Lista de correções em formato de array de tuplas
$correcoes = @(
    @("DelikÃ¡", "Deliká"),
    @("DelikÃƒÂ¡", "Deliká"),
    @("Embu-GuaÃ§u", "Embu-Guaçu"),
    @("Embu-GuaÃƒÂ§u", "Embu-Guaçu"),
    @("CardÃ¡pio", "Cardápio"),
    @("CardÃƒÂ¡pio", "Cardápio"),
    @("confeitaria artesanal em Embu-GuaÃ§u", "confeitaria artesanal em Embu-Guaçu"),
    @("confeitaria artesanal em Embu-GuaÃƒÂ§u", "confeitaria artesanal em Embu-Guaçu"),
    @("Chef Karina, DelikÃ¡", "Chef Karina, Deliká"),
    @("Chef Karina, DelikÃƒÂ¡", "Chef Karina, Deliká"),
    @("OtimizaÃ§Ãµes", "Otimizações"),
    @("OtimizaÃƒÂ§ÃƒÂµes", "Otimizações"),
    @("ÃƒÂ§", "ç"),
    @("Ã£", "ã"),
    @("Ã©", "é"),
    @("Ã­", "í"),
    @("Ã³", "ó"),
    @("Ãº", "ú"),
    @("Ã¢", "â"),
    @("Ãª", "ê"),
    @("Ã´", "ô"),
    @("Ã ", "à"),
    @("Ã¼", "ü"),
    @("Ã‡", "Ç"),
    @("Ãƒ", "Ã"),
    @("Ã•", "Õ"),
    @("Ã•", "Õ"),
    @("Ã", "Á"),
    @("Ã‰", "É"),
    @("Ã", "Í"),
    @("Ã", "Ó"),
    @("Ãš", "Ú"),
    @("Ã‚", "Â"),
    @("ÃŠ", "Ê"),
    @("Ã", "Ô"),
    @("Ã€", "À"),
    @("Ãœ", "Ü")
)

$contador = 0

Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Encoding UTF8 -Raw
    $original = $content
    
    foreach ($item in $correcoes) {
        $content = $content -replace [regex]::Escape($item[0]), $item[1]
    }
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        $contador++
    }
}

Write-Host "Arquivos modificados: $contador" -ForegroundColor Yellow

# Verificação
$resultado = Get-ChildItem -Recurse -Filter *.html | Select-String -Pattern "DelikÃ|Embu-GuaÃ" 
if ($resultado) {
    Write-Host "Ainda encontrados caracteres suspeitos" -ForegroundColor Red
} else {
    Write-Host "VERIFICACAO CONCLUIDA" -ForegroundColor Green
}