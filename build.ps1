# Script de build para incluir partials automaticamente
param(
    [string]$PageName = "cardapio.html"
)

# Função para incluir partials
function Include-Partial {
    param($filePath)
    if (Test-Path $filePath) {
        Get-Content $filePath -Raw
    } else {
        Write-Warning "Partial não encontrado: $filePath"
        ""
    }
}

# Processar arquivo HTML
$inputFile = "_legacy/$PageName"
$outputFile = "$PageName"

if (Test-Path $inputFile) {
    $content = Get-Content $inputFile -Raw
    
    # Substituir placeholders pelos partials
    $content = $content -replace '\{\{>\s*partials/header\s*\}\}', (Include-Partial "_legacy/partials/header.html")
    $content = $content -replace '\{\{>\s*partials/footer\s*\}\}', (Include-Partial "_legacy/partials/footer.html")
    
    # Salvar arquivo processado
    $content | Out-File -FilePath $outputFile -Encoding utf8
    Write-Host "✅ Build completo: $outputFile"
} else {
    Write-Error "Arquivo não encontrado: $inputFile"
}