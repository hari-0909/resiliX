const {PrismaClient}=require("@prisma/client")

process.env.DATABASE_URL=process.env.DATABASE_URL||"postgresql://postgres:postgres@postgres:5432/testdb"

const prisma=new PrismaClient()

module.exports=prisma
