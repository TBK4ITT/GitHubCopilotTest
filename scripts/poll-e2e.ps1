$runId = 20883481308
for ($i=1; $i -le 120; $i++) {
  $r = gh run view $runId --repo TBK4ITT/GitHubCopilotTest --json status,conclusion 2>$null
  if (-not $r) { Write-Output ('poll {0}: no output' -f $i); Start-Sleep -Seconds 6; continue }
  $o = $r | ConvertFrom-Json
  Write-Output ('poll {0}: status={1} conclusion={2}' -f $i, $o.status, $o.conclusion)
  if ($o.status -eq 'completed') {
    if ($o.conclusion -eq 'success') { Write-Output 'E2E succeeded on main'; exit 0 }
    else { Write-Output 'E2E failed on main; fetching logs'; gh run view $runId --repo TBK4ITT/GitHubCopilotTest --log-failed; exit 2 }
  }
  Start-Sleep -Seconds 6
}
Write-Output 'Timed out waiting for E2E to finish'; exit 3
