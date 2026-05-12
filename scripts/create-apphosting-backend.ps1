param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,

  [string]$Backend = "smartflow-ai",

  [string]$Region = "us-central1",

  [string]$RootDir = "."
)

$ErrorActionPreference = "Stop"

firebase apphosting:backends:create `
  --project $ProjectId `
  --backend $Backend `
  --primary-region $Region `
  --root-dir $RootDir `
  --non-interactive
