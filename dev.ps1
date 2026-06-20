# Run backend (FastAPI) and frontend (Next.js) together.
# Usage:  ./dev.ps1     (or: pnpm dev)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$backend = Start-Process -PassThru -NoNewWindow `
  -FilePath "$root\backend\.venv\Scripts\python.exe" `
  -ArgumentList "-m", "uvicorn", "app.main:app", "--app-dir", "$root\backend", "--host", "127.0.0.1", "--port", "8077"

$frontend = Start-Process -PassThru -NoNewWindow `
  -FilePath "pnpm" -ArgumentList "-C", "$root\frontend", "dev"

Write-Host "Backend  -> http://127.0.0.1:8077  (PID $($backend.Id))" -ForegroundColor Green
Write-Host "Frontend -> http://127.0.0.1:3007  (PID $($frontend.Id))" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both." -ForegroundColor Yellow

try {
  Wait-Process -Id $backend.Id, $frontend.Id
} finally {
  $backend, $frontend | ForEach-Object {
    if ($_ -and -not $_.HasExited) { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
  }
}
