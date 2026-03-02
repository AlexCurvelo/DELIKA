<#
.SYNOPSIS
Limpeza definitiva de encoding UTF-8 para todos os arquivos HTML
#>

Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "LIMPEZA DEFINITIVA DE ENCODING UTF-8" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Contador de arquivos processados
$contador = 0

# Processar todos os arquivos HTML
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $arquivo = $_.FullName
    
    # Ler conteúdo como Default (Windows-1252 / ISO-8859-1)
    $content = Get-Content -Path $arquivo -Encoding Default -Raw -ErrorAction SilentlyContinue
    
    if ($null -eq $content) {
        Write-Host "Erro ao ler: $($_.Name)" -ForegroundColor Red
        return
    }
    
    # Substituir charset antigo
    $content = $content -replace '<meta\s+http-equiv=["'']?Content-Type["'']?\s+content=["'']?[^"'']*charset=[^"'']+["'']?', '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'
    $content = $content -replace '<meta\s+charset=["'']?[^"'']+["'']?>', '<meta charset="utf-8">'
    
    # Garantir que charset UTF-8 existe no head
    if ($content -notmatch '<meta\s+charset=["'']?utf-?8["'']?>') {
        $content = $content -replace '<head>', '<head>`n  <meta charset="utf-8">'
    }
    
    # Salvar como UTF-8 com BOM
    Set-Content -Path $arquivo -Value $content -Encoding UTF8 -NoNewline
    
    $contador++
    Write-Host "[$contador] Processado: $($_.Name)" -ForegroundColor Green
}

Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "TOTAL DE ARQUIVOS PROCESSADOS: $contador" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "`nVerificando caracteres residuais..." -ForegroundColor Yellow

# Verificar se ainda há caracteres corrompidos
$resultado = Get-ChildItem -Recurse -Filter *.html | Select-String -Pattern "Ã[áãéíóúç]" -ErrorAction SilentlyContinue

if ($resultado) {
    Write-Host "`nArquivos ainda com caracteres suspeitos:" -ForegroundColor Red
    $resultado | Group-Object Path | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Count) ocorrências" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✅ TODOS OS ARQUIVOS ESTÃO LIMPOS!" -ForegroundColor Green
}
