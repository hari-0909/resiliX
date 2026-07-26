const prisma=require("../services/prismaClient")

function toDomain(template){
    if(!template){
        return null
    }

    return {
        id:template.id,
        name:template.name,
        executionType:template.executionType,
        targetService:template.targetService,
        namespace:template.namespace,
        duration:template.duration,
        parameters:template.parameters,
        scheduleMode:template.scheduleMode,
        scheduledAt:template.scheduledAt?template.scheduledAt.toISOString():null,
        cronExpression:template.cronExpression,
        scheduleStatus:template.scheduleStatus,
        createdAt:template.createdAt.toISOString(),
        updatedAt:template.updatedAt.toISOString()
    }
}

async function save(template){
    const saved=await prisma.template.upsert({
        where:{id:template.id},
        update:template,
        create:template
    })
    return toDomain(saved)
}

async function list(){
    const templates=await prisma.template.findMany({
        orderBy:{createdAt:"asc"}
    })
    return templates.map(toDomain)
}

async function getById(id){
    const template=await prisma.template.findUnique({
        where:{id}
    })
    return toDomain(template)
}

async function remove(id){
    const template=await prisma.template.delete({
        where:{id}
    })
    return toDomain(template)
}

module.exports={save,list,getById,remove}
