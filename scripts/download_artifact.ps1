param(
    [Parameter(Mandatory=$false)]
    [int]$runId = 20884344735,
    [Parameter(Mandatory=$false)]
    [int]$artifactId = 5086520276
)

# Prompt securely for PAT
$sec = Read-Host -AsSecureString 'Enter GitHub Personal Access Token (repo scope)'
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)

$headers = @{ Authorization = "token $token"; Accept = 'application/vnd.github+json'; 'User-Agent' = 'request' }

Write-Output "Listing artifacts for run $runId..."
$resp = Invoke-RestMethod -Uri "https://api.github.com/repos/TBK4ITT/GitHubCopilotTest/actions/runs/$runId/artifacts" -Headers $headers -UseBasicParsing

$artifact = $resp.artifacts | Where-Object { $_.id -eq $artifactId }
if (-not $artifact) {
    Write-Error "Artifact with id $artifactId not found in run $runId"
    exit 1
}

$download = $artifact.archive_download_url
Write-Output "Downloading $download ..."
Invoke-WebRequest -Uri $download -Headers $headers -OutFile 'playwright-report.zip' -UseBasicParsing
Write-Output 'Download complete: playwright-report.zip'






Get-ChildItem -Path 'playwright-report' -Recurse | Select-Object FullName, Length | ConvertTo-Json -Depth 5Write-Output 'Extracted to playwright-report/'Expand-Archive -Path 'playwright-report.zip' -DestinationPath 'playwright-report' -Forcenif (Test-Path 'playwright-report') { Remove-Item -Recurse -Force 'playwright-report' }