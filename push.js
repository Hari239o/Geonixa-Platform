const { execSync } = require('child_process');
try {
  console.log("Running Prisma db push...");
  const output = execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe', env: process.env });
  console.log("SUCCESS:", output.toString());
} catch(e) {
  console.log("FAILED.");
  if (e.stdout) console.log("STDOUT:", e.stdout.toString());
  if (e.stderr) console.log("STDERR:", e.stderr.toString());
}
