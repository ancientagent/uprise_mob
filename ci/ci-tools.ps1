# CI Tools PowerShell Script
# Provides GitHub Actions workflow management commands

param(
    [Parameter(Position=0)]
    [string]$Command
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "CI Tools - GitHub Actions workflow management"
    Write-Host ""
    Write-Host "Usage: pwsh -File ./ci/ci-tools.ps1 <command>"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  list    - List recent workflow runs"
    Write-Host "  jobs    - Show jobs for current run"
    Write-Host "  tail    - Watch live logs for current run"
    Write-Host "  rerun   - Rerun failed jobs"
    Write-Host ""
}

function Get-CurrentRun {
    try {
        $runs = & gh run list --limit 1 --json databaseId,status,conclusion
        if ($runs) {
            $run = $runs | ConvertFrom-Json | Select-Object -First 1
            return $run.databaseId
        }
        return $null
    }
    catch {
        Write-Error "Failed to get current run: $_"
        return $null
    }
}

function Invoke-ListRuns {
    Write-Host "Recent workflow runs:"
    & gh run list --limit 10
}

function Invoke-ShowJobs {
    $runId = Get-CurrentRun
    if ($runId) {
        Write-Host "Jobs for run $runId :"
        & gh run view $runId
    } else {
        Write-Error "No current run found"
    }
}

function Invoke-TailLogs {
    $runId = Get-CurrentRun
    if ($runId) {
        Write-Host "Watching logs for run $runId (Ctrl+C to stop):"
        & gh run watch $runId
    } else {
        Write-Error "No current run found"
    }
}

function Invoke-RerunFailed {
    $runId = Get-CurrentRun
    if ($runId) {
        Write-Host "Rerunning failed jobs for run $runId :"
        & gh run rerun $runId --failed
    } else {
        Write-Error "No current run found"
    }
}

# Main command dispatch
switch ($Command.ToLower()) {
    "list" { Invoke-ListRuns }
    "jobs" { Invoke-ShowJobs }
    "tail" { Invoke-TailLogs }
    "rerun" { Invoke-RerunFailed }
    default { Show-Help }
}
