$ErrorActionPreference = 'Stop'
$browserRoot = $PSScriptRoot
$address = 'http://127.0.0.1:8765'
$running = $false
try { $reply = Invoke-WebRequest -Uri ($address + '/bridge.js') -UseBasicParsing -TimeoutSec 2; $running = $reply.Content.Contains('BrowserSimulation') } catch {}
if (-not $running) {
    $node = Join-Path $browserRoot 'tools\node.exe'; if (-not (Test-Path $node)) { $node = 'node' }  # Node from PATH when the bundled copy is absent
    Start-Process -FilePath $node -ArgumentList ('"' + (Join-Path $browserRoot 'serve.mjs') + '"') -WorkingDirectory $browserRoot -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 200
        try { $reply = Invoke-WebRequest -Uri ($address + '/bridge.js') -UseBasicParsing -TimeoutSec 1; if ($reply.Content.Contains('BrowserSimulation')) { $running = $true; break } } catch {}
    }
}
if (-not $running) { throw 'The local Civilization server could not start on port 8765.' }
Start-Process $address
