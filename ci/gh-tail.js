#!/usr/bin/env node
// Tail the latest Android debug build workflow run

const { execSync, spawn } = require('child_process');

try {
  // Get the latest workflow run
  const latestRun = execSync('gh run list --workflow="Android Build & Smoke Test" --limit=1 --json=databaseId,status,conclusion', { encoding: 'utf8' });
  const runs = JSON.parse(latestRun);
  
  if (runs.length === 0) {
    console.log('No workflow runs found');
    process.exit(1);
  }
  
  const run = runs[0];
  const runId = run.databaseId;
  
  console.log(`Watching workflow ${runId} (status: ${run.status})...`);
  
  if (run.status === 'completed') {
    console.log(`Workflow already completed with conclusion: ${run.conclusion}`);
    // Show the results immediately
    execSync(`gh run view ${runId}`, { stdio: 'inherit' });
    process.exit(0);
  }
  
  // Use gh run watch for live monitoring
  const watcher = spawn('gh', ['run', 'watch', runId.toString()], {
    stdio: 'inherit'
  });
  
  watcher.on('close', (code) => {
    console.log(`\nWorkflow monitoring finished with code ${code}`);
    
    // Show final results
    console.log('\n=== Final Results ===');
    try {
      execSync(`gh run view ${runId}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error getting final results:', error.message);
    }
  });
  
} catch (error) {
  console.error('❌ Failed to watch workflow:', error.message);
  process.exit(1);
}