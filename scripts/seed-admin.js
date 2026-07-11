const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'Admin@kalinq.com'
  const password = 'Kalinq@123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'admin',
      name: 'Admin Kalinq'
    },
    create: {
      email,
      password: hashedPassword,
      role: 'admin',
      name: 'Admin Kalinq',
      profileCompleted: true
    },
  })

  console.log('Admin user seeded:', adminUser.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
