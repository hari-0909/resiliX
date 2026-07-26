const prisma=require("../services/prismaClient")
const {toDomain:analysisToDomain}=require("./analysisRepository")

function toDomain(result){
    if(!result){
        return null
    }

    const domain={
        executionId:result.executionId,
        experimentId:result.experimentId,
        status:result.status,
        startedAt:result.startedAt.toISOString(),
        completedAt:result.completedAt.toISOString(),
        metricsBefore:result.metricsBefore,
        metricsAfter:result.metricsAfter
    }

    if(result.analysis!==undefined){
        domain.analysis=analysisToDomain(result.analysis)
    }

    if(result.error){
        domain.error=result.error
    }

    return domain
}

async function save(result){
    const saved=await prisma.result.upsert({
        where:{executionId:result.executionId},
        update:result,
        create:result,
        include:{analysis:true}
    })
    return toDomain(saved)
}

async function list(){
    const results=await prisma.result.findMany({
        orderBy:{completedAt:"asc"},
        include:{analysis:true}
    })
    return results.map(toDomain)
}

async function getById(id){
    const result=await prisma.result.findUnique({
        where:{executionId:id},
        include:{analysis:true}
    })
    return toDomain(result)
}

module.exports={save,list,getById}
