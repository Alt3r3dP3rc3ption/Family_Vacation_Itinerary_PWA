$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

function Read-RepoFile($Path) {
  Get-Content -LiteralPath (Join-Path $Root $Path) -Raw
}

function Test-RepoPath($Path) {
  Test-Path -LiteralPath (Join-Path $Root $Path)
}

$script:Failures = 0
function Check($Name, $Condition) {
  if ($Condition) {
    Write-Host "PASS $Name"
  } else {
    $script:Failures += 1
    Write-Error "FAIL $Name" -ErrorAction Continue
  }
}

$Index = Read-RepoFile "index.html"
$Sw = Read-RepoFile "sw.js"
$Components = Read-RepoFile "app/components.jsx"
$App = Read-RepoFile "app/app.jsx"
$Store = Read-RepoFile "app/store.js"
$Settings = Read-RepoFile "app/settings.jsx"
$Travel = if (Test-RepoPath "app/travel.jsx") { Read-RepoFile "app/travel.jsx" } else { "" }

Check "Travel screen file exists" (Test-RepoPath "app/travel.jsx")
Check "index loads travel screen before app root" (($Index -match "app/travel\.jsx") -and ($Index.IndexOf("app/travel.jsx") -lt $Index.IndexOf("app/app.jsx")))
Check "service worker caches travel screen" ($Sw -match "app/travel\.jsx")
Check "Travel tab is registered" (($Components -match "id:\s*['\""]travel['\""]") -and ($Components -match "label:\s*['\""]Travel['\""]"))
Check "App routes TravelScreen" (($App -match "tab === ['\""]travel['\""]") -and ($App -match "<TravelScreen\b"))
Check "Store exposes travel state" (($Store -match "getTravel") -and ($Store -match "setTravel"))
Check "Store exposes map link place add" ($Store -match "addPlaceFromMapsLink")
Check "Store exposes JSON backup and restore" (($Store -match "toJSON") -and ($Store -match "restoreJSON"))
Check "Settings exposes JSON backup controls" (($Settings -match "Export JSON") -and ($Settings -match "Restore JSON"))
Check "Travel screen has required sections" (($Travel -match "Air France") -and ($Travel -match "Emergency") -and ($Travel -match "Offline Maps") -and ($Travel -match "Readiness") -and ($Travel -match "Google Maps"))
Check "Travel screen avoids real offline tile storage claims" ($Travel -notmatch "download tiles|tile storage|leaflet\.offline")

if ($script:Failures -gt 0) {
  Write-Error "$script:Failures verification check(s) failed."
  exit 1
}

Write-Host ""
Write-Host "All static PWA verification checks passed."
