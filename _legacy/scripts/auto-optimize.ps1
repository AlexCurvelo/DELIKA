<#
.SYNOPSIS
Monitora e otimiza automaticamente novas imagens

.DESCRIPTION
Observa a pasta img/ e converte automaticamente novas imagens para WebP

.PARAMETER WatchPath
Pasta para monitorar (padrão: ./img)

.EXAMPLE
.\auto-optimize.ps1
#>

param(
    [string]$WatchPath = "./img"
)

# Verificar ImageMagick
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ImageMagick não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "👀 Monitorando: $WatchPath" -ForegroundColor Cyan
Write-Host "🔄 Novas imagens serão automaticamente convertidas para WebP" -ForegroundColor Cyan
Write-Host "⏹️ Pressione Ctrl+C para parar" -ForegroundColor Yellow

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $WatchPath
$watcher.Filter = "*.jpg"
$watcher.Filter = "*.jpeg"
$watcher.Filter = "*.png"
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $name = $Event.SourceEventArgs.Name
    
    if ($changeType -eq 'Created') {
        Write-Host "🔄 Nova imagem detectada: $name" -ForegroundColor Yellow
        
        # Aguardar o upload completar
        Start-Sleep -Seconds 2
        
        # Converter para WebP
        $webpPath = [System.IO.Path]::ChangeExtension($path, ".webp")
        
        try {
            magick $path -quality 85 $webpPath
            Write-Host "✅ Convertido: $name → $(Split-Path $webpPath -Leaf)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao converter $name: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Register-ObjectEvent $watcher "Created" -Action $action

# Manter o script executando
while ($true) {
    Start-Sleep -Seconds 1
}