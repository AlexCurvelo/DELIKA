# Listar arquivos que ainda contêm caracteres corrompidos
Get-ChildItem -Recurse -Filter *.html | Select-String -Pattern "Ã[^\s]"# 1. Backup dos arquivos originais
Compress-Archive -Path *.html -DestinationPath backup_html.zip

# 2. Conversão forçada para UTF-8 com BOM
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Encoding Default
    Set-Content -Path $_.FullName -Value $content -Encoding UTF8BOM
}# 1. Backup dos arquivos originais
Compress-Archive -Path *.html -DestinationPath backup_html.zip

# 2. Conversão forçada para UTF-8 com BOM
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Encoding Default
    Set-Content -Path $_.FullName -Value $content -Encoding UTF8BOM
}<#
.SYNOPSIS
Corrige encoding UTF-8 em arquivos HTML com Mojibake

.DESCRIPTION
Substitui caracteres corrompidos (Ã¡, Ã£, Ã©, Ã³, Ã§) por suas formas corretas
#>

# Mapeamento de correções (sem duplicatas)
$correcoes = @{
    "Ã¡" = "á"
    "Ã£" = "ã" 
    "Ã©" = "é"
    "Ã³" = "ó"
    "Ã§" = "ç"
    "Ã¢" = "â"
    "Ãº" = "ú"
    "Ãª" = "ê"
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

Write-Host "`n✅ TODOS OS ARQUIVOS FORAM CORRIGIDOS" -ForegroundColor Cyan