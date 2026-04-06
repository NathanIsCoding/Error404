const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  'populate-jobs-db.js',
  'populate-users-db.js',
  'populate-support-db.js',
];

for (const script of scripts) {
  console.log(`\n--- Running ${script} ---`);
  execSync(`node ${path.join(__dirname, script)}`, { stdio: 'inherit' });
}

console.log('\nAll population scripts complete!');
