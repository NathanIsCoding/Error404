const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  'populate-users-db.js',
  'populate-jobs-db.js',
  'populate-applications-db.js',
  'populate-support-db.js',
  'populate-ratings-db.js',
];

for (const script of scripts) {
  console.log(`\n--- Running ${script} ---`);
  execSync(`node ${path.join(__dirname, script)}`, { stdio: 'inherit' });
}

console.log('\nAll population scripts complete!');
