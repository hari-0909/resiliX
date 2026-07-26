const prisma=require("../services/prismaClient")

function toDomain(execution){
    if(!execution){
        return null
    }

    return {
        id:execution.id,
        experimentId:execution.experimentId,
        status:execution.status,
        source:execution.source,
        createdAt:execution.createdAt.toISOString(),
        queuedAt:execution.queuedAt?execution.queuedAt.toISOString():null
    }
}

async function save(execution){
    const saved=await prisma.execution.upsert({
        where:{id:execution.id},
        update:execution,
        create:execution
    })
    return toDomain(saved)
}

async function list(){
    const executions=await prisma.execution.findMany({
        orderBy:{createdAt:"asc"}
    })
    return executions.map(toDomain)
}

async function getById(id){
    const execution=await prisma.execution.findUnique({
        where:{id}
    })
    return toDomain(execution)
}

module.exports={save,list,getById}
