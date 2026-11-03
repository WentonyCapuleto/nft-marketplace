$ErrorActionPreference = 'Stop'

Write-Host "=== KURIO | Verificacao e instalacao ===" -ForegroundColor Cyan

function Test-Command($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Test-Command 'node')) {
  throw "Node.js nao encontrado. Instale a versao LTS em https://nodejs.org/ e abra um novo PowerShell."
}
if (-not (Test-Command 'npm')) {
  throw "npm nao encontrado. Reinstale o Node.js LTS marcando a opcao de adicionar ao PATH."
}

node --version
npm --version

Write-Host "Verificando acesso ao registro do npm..." -ForegroundColor Yellow
try {
  $null = Invoke-WebRequest -Uri 'https://registry.npmjs.org/' -Method Get -TimeoutSec 20
} catch {
  throw "O Windows nao conseguiu acessar https://registry.npmjs.org/. Verifique internet, DNS, proxy ou firewall e tente novamente. Detalhe: $($_.Exception.Message)"
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Instalando dependencias da API..." -ForegroundColor Yellow
Push-Location (Join-Path $root 'server')
try {
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias da API (codigo $LASTEXITCODE)." }
} finally { Pop-Location }

Write-Host "Instalando dependencias do frontend..." -ForegroundColor Yellow
Push-Location $root
try {
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias do frontend (codigo $LASTEXITCODE)." }
} finally { Pop-Location }

Write-Host "Instalacao concluida. Proximos passos: iniciar PostgreSQL, configurar server/.env e executar npm run dev na raiz e npm run dev na pasta server." -ForegroundColor Green
