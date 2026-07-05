@echo off
call npx prisma generate
call npx prisma db push --accept-data-loss
call npx tsx test-db.ts
