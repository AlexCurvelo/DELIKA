<#
.SYNOPSIS
Script de otimização de imagens para o site Deliká

.DESCRIPTION
Converte imagens para WebP e otimiza PNG/JPG para melhor performance

.PARAMETER InputPath
Caminho das imagens a serem otimizadas (padrão: ./img)

.PARAMETER Quality
Qualidade da compressão (1-100, padrão: 85)

.EXAMPLE
.\optimize-images.ps1 -InputPath ./img -Quality 85
#>

param(
    [string]$InputPath = "./img",
    [int]$Quality = 85
)

# Verificar se ImageMagick está instalado
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ImageMagick não encontrado. Instalando..." -ForegroundColor Red
    
    # Tentar instalar via winget
    try {
        winget install ImageMagick.ImageMagick --silent --accept-package-agreements --accept-source-agreements
        Write-Host "✅ ImageMagick instalado com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "❌ Falha na instalação do ImageMagick: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Verificar se o caminho de entrada existe
if (-not (Test-Path $InputPath)) {
    Write-Host "❌ Caminho não encontrado: $InputPath" -ForegroundColor Red
    exit 1
}

# Estatísticas iniciais
$totalOriginalSize = 0
$totalOptimizedSize = 0
$processedFiles = 0

Write-Host "📊 Iniciando otimização de imagens em: $InputPath" -ForegroundColor Cyan
Write-Host "🎯 Qualidade alvo: $Quality" -ForegroundColor Cyan
Write-Host "─" * 50

# Processar imagens
Get-ChildItem -Path $InputPath -Include *.jpg, *.jpeg, *.png | ForEach-Object {
    $file = $_
    $originalSize = $file.Length
    $totalOriginalSize += $originalSize
    
    Write-Host "🔄 Processando: $($file.Name) ($([math]::Round($originalSize/1KB, 2)) KB)" -ForegroundColor Yellow
    
    # Gerar nome para versão WebP
    $webpName = [System.IO.Path]::ChangeExtension($file.FullName, ".webp")
    
    try {
        # Converter para WebP
        magick $file.FullName -quality $Quality $webpName
        
        $webpSize = (Get-Item $webpName).Length
        $savings = $originalSize - $webpSize
        $savingsPercent = ($savings / $originalSize) * 100
        
        Write-Host "✅ WebP criado: $([math]::Round($webpSize/1KB, 2)) KB ($([math]::Round($savingsPercent, 1))% economizado)" -ForegroundColor Green
        
        $totalOptimizedSize += $webpSize
        $processedFiles++
        
    } catch {
        Write-Host "❌ Erro ao processar $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Estatísticas finais
if ($processedFiles -gt 0) {
    Write-Host "─" * 50
    Write-Host "📈 ESTATÍSTICAS FINAIS:" -ForegroundColor Cyan
    Write-Host "Arquivos processados: $processedFiles" -ForegroundColor White
    Write-Host "Tamanho original: $([math]::Round($totalOriginalSize/1MB, 2)) MB" -ForegroundColor White
    Write-Host "Tamanho otimizado: $([math]::Round($totalOptimizedSize/1MB, 2)) MB" -ForegroundColor White
    
    $totalSavings = $totalOriginalSize - $totalOptimizedSize
    $totalSavingsPercent = ($totalSavings / $totalOriginalSize) * 100
    
    Write-Host "💰 Economia total: $([math]::Round($totalSavings/1MB, 2)) MB ($([math]::Round($totalSavingsPercent, 1))%)" -ForegroundColor Green
    Write-Host "🚀 Performance melhorada significativamente!" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Nenhum arquivo foi processado" -ForegroundColor Yellow
}

Write-Host "`n🎉 Otimização concluída! Use as versões .webp no seu HTML:" -ForegroundColor Green
Write-Host "<img src='img/nome-da-imagem.webp' alt='Descrição' loading='lazy'>" -ForegroundColor Magenta