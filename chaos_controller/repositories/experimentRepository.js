const prisma=require("../services/prismaClient")

function toDomain(experiment){
    if(!experiment){
        return null
    }

    return {
        id:experiment.id,
        chaosType:experiment.chaosType,
        target:experiment.target,
        mode:experiment.mode,
        createdAt:experiment.createdAt.toISOString()
    }
}

async function save(experiment){
    const saved=await prisma.experiment.upsert({
        where:{id:experiment.id},
        update:experiment,
        create:experiment
    })
    return toDomain(saved)
}

async function list(){
    const experiments=await prisma.experiment.findMany({
        orderBy:{createdAt:"asc"}
    })
    return experiments.map(toDomain)
}

async function getById(id){
    const experiment=await prisma.experiment.findUnique({
        where:{id}
    })
    return toDomain(experiment)
}

module.exports={save,list,getById}
