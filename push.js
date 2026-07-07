const fs = require('fs');
const { execSync } = require('child_process');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
env.forEach(l => {
  if (l.includes('=')) {
    const [k, ...v] = l.split('=');
    process.env[k.trim()] = v.join('=').trim().replace(/['"]+/g, '');
  }
});

execSync('npx prisma db push', { stdio: 'inherit', env: process.env });
execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
