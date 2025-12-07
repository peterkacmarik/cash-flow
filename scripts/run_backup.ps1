# Backup pomocou Supabase API
# Tento skript nacita premenne z .env.backup a spusti zalohu

$ErrorActionPreference = "Stop"

Write-Host "Supabase Database Backup - API Method" -ForegroundColor Cyan
Write-Host "======================================"
Write-Host ""

# Check if .env.backup exists
if (-not (Test-Path ".env.backup")) {
    Write-Host "Error: .env.backup file not found!" -ForegroundColor Red
    Write-Host "Please create .env.backup with:" -ForegroundColor Yellow
    Write-Host "  SUPABASE_URL=https://lfibaygcxftjdkmuigim.supabase.co"
    Write-Host "  SUPABASE_SERVICE_KEY=your_service_role_key_here"
    exit 1
}

Write-Host "Loading environment variables from .env.backup..."

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
Write-Host "Starting backup..."
Write-Host ""

# Run the backup script
node ./scripts/backup_supabase.mjs

Write-Host ""
Write-Host "Backup process completed!" -ForegroundColor Green
