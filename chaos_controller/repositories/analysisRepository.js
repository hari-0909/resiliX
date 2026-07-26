const prisma=require("../services/prismaClient")

function toDomain(analysis){
    if(!analysis){
        return null
    }

    return {
        executionId:analysis.executionId,
        experimentId:analysis.experimentId,
        cpuDelta:analysis.cpuDelta,
        memoryDelta:analysis.memoryDelta,
        latencyDelta:analysis.latencyDelta,
        errorRateDelta:analysis.errorRateDelta,
        podRestartDelta:analysis.podRestartDelta,
        summary:analysis.summary,
        createdAt:analysis.createdAt.toISOString()
    }
}

async function save(analysis){
    const saved=await prisma.analysis.upsert({
        where:{executionId:analysis.executionId},
        update:analysis,
        create:analysis
    })
    return toDomain(saved)
}

async function getByExecutionId(executionId){
    const analysis=await prisma.analysis.findUnique({
        where:{executionId}
    })
    return toDomain(analysis)
}

async function list(){
    const analyses=await prisma.analysis.findMany({
        orderBy:{createdAt:"asc"}
    })
    return analyses.map(toDomain)
}

module.exports={save,getByExecutionId,list,toDomain}
