param(
    [Parameter(Mandatory=$false)]
    [int]$jobId = 65240256295
)

$sec = Read-Host -AsSecureString 'Enter GitHub PAT'
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)

$headers = @{Authorization = "token $token"; 'User-Agent'='request'}

$url = "https://api.github.com/repos/TBK4ITT/GitHubCopilotTest/actions/jobs/$jobId/logs"
Write-Output "Downloading logs for job $jobId..."
Invoke-WebRequest -Uri $url -Headers $headers -OutFile "job${jobId}-logs.zip" -UseBasicParsing
Write-Output "Saved to job${jobId}-logs.zip"