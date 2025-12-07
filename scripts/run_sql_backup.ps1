# Backup pomocou SQL exportu
# Tento skript vytvori kompletny SQL dump databazy

$ErrorActionPreference = "Stop"

Write-Host "Supabase SQL Dump Backup" -ForegroundColor Cyan
Write-Host "========================"
Write-Host ""

# Check if .env.backup exists
if (-not (Test-Path ".env.backup")) {
    Write-Host "Error: .env.backup file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Loading environment variables..."

# Load .env.backup
Get-Content .env.backup | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]*)\s*=\s*(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
        Write-Host "  OK Loaded $name" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Generating SQL backup..."
Write-Host ""

# Run the SQL backup script
node ./scripts/backup_sql.mjs

Write-Host ""
Write-Host "SQL backup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Tento SQL subor mozete pouzit na obnovenie databazy:" -ForegroundColor Yellow
Write-Host "1. Otvorte Supabase Dashboard -> SQL Editor" -ForegroundColor Yellow
Write-Host "2. Skopirujte obsah .sql suboru" -ForegroundColor Yellow
Write-Host "3. Spustite SQL prikazy" -ForegroundColor Yellow
