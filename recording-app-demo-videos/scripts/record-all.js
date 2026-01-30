const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const storiesDir = path.join(__dirname, 'stories');
const outputDir = path.join(__dirname, 'output');
const authStatePath = path.join(__dirname, '.auth-state.json');

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, '_raw'), { recursive: true });

if (!fs.existsSync(authStatePath)) {
  console.log('No auth state found. Run setup-auth.js first:');
  console.log('  node scripts/demo-videos/setup-auth.js\n');
  process.exit(1);
}

const scripts = fs.readdirSync(storiesDir)
  .filter(f => f.endsWith('.js'))
  .sort();

console.log(`\nRecording ${scripts.length} demo videos...\n`);

let passed = 0;
let failed = 0;

for (const script of scripts) {
  const name = script.replace('.js', '');
  console.log(`> Recording: ${name}`);
  try {
    execSync(`node ${path.join(storiesDir, script)}`, {
      stdio: 'inherit',
      env: { ...process.env },
    });
    passed++;
  } catch (err) {
    console.error(`  Failed: ${name}\n`);
    failed++;
  }
}

console.log(`\nDone! ${passed} recorded, ${failed} failed.`);
console.log(`Videos in: ${outputDir}\n`);

// Clean up _raw directory
const rawDir = path.join(outputDir, '_raw');
try {
  const rawFiles = fs.readdirSync(rawDir);
  for (const f of rawFiles) fs.unlinkSync(path.join(rawDir, f));
  fs.rmdirSync(rawDir);
} catch {}
