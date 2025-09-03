#!/usr/bin/env node
// Trigger a rerun of the latest Android debug build workflow

const { execSync } = require('child_process');

try {
  // Get the latest workflow run
  const latestRun = execSync('gh run list --workflow="Android Build & Smoke Test" --limit=1 --json=databaseId', { encoding: 'utf8' });
  const runs = JSON.parse(latestRun);
  
  if (runs.length === 0) {
    console.log('No workflow runs found');
    process.exit(1);
  }
  
  const runId = runs[0].databaseId;
  console.log(`Rerunning workflow ${runId}...`);
  
  execSync(`gh run rerun ${runId}`, { stdio: 'inherit' });
  console.log(`✅ Workflow ${runId} rerun triggered`);
  
} catch (error) {
  console.error('❌ Failed to rerun workflow:', error.message);
  process.exit(1);
}