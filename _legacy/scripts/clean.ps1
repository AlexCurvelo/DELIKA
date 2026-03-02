$contador = 0

Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Encoding UTF8 -Raw
    $original = $content
    
    $content = $content -replace [char]0xC3 + [char]0xA1, "á"
    $content = $content -replace [char]0xC3 + [char]0xA3, "ã"
    $content = $content -replace [char]0xC3 + [char]0xA9, "é"
    $content = $content -replace [char]0xC3 + [char]0xAD, "í"
    $content = $content -replace [char]0xC3 + [char]0xB3, "ó"
    $content = $content -replace [char]0xC3 + [char]0xBA, "ú"
    $content = $content -replace [char]0xC3 + [char]0xA7, "ç"
    $content = $content -replace [char]0xC3 + [char]0x82, "â"
    $content = $content -replace [char]0xC3 + [char]0xAA, "ê"
    $content = $content -replace [char]0xC3 + [char]0xB4, "ô"
    $content = $content -replace [char]0xC3 + [char]0xA0, "à"
    $content = $content -replace [char]0xC3 + [char]0xBC, "ü"
    
    $content = $content -replace [char]0xC3 + [char]0x81, "Á"
    $content = $content -replace [char]0xC3 + [char]0x83, "Ã"
    $content = $content -replace [char]0xC3 + [char]0x89, "É"
    $content = $content -replace [char]0xC3 + [char]0x8D, "Í"
    $content = $content -replace [char]0xC3 + [char]0x93, "Ó"
    $content = $content -replace [char]0xC3 + [char]0x9A, "Ú"
    $content = $content -replace [char]0xC3 + [char]0x87, "Ç"
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8 -NoNewline
        $contador++
    }
}

Write-Host "Arquivos modificados: $contador"