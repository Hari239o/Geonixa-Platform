const { PrismaClient } = require('@prisma/client');

const regions = [
  "aws-0-ap-south-1",
  "aws-0-us-east-1",
  "aws-0-eu-west-1",
  "aws-0-ap-southeast-1",
  "aws-0-ap-southeast-2",
  "aws-0-eu-central-1",
];

async function main() {
  for (const region of regions) {
    console.log(`Testing ${region}...`);
    const url = `postgresql://postgres.wcqwezsngpcewmluezbu:Kalinq%402026@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    
    const prisma = new PrismaClient({
      datasources: { db: { url } }
    });
    
    try {
      await prisma.user.findFirst();
      console.log(`SUCCESS! Found correct region: ${region}`);
      await prisma.$disconnect();
      return;
    } catch (e) {
      console.log(`Failed for ${region}: ${e.message.split('\n')[0]}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}
main();
