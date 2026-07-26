const prisma=require("../services/prismaClient")

function toDomain(report){
    if(!report){
        return null
    }

    return {
        executionId:report.executionId,
        experimentId:report.experimentId,
        experiment:report.experiment,
        execution:report.execution,
        result:report.resultSnapshot,
        metricsBefore:report.metricsBefore,
        metricsAfter:report.metricsAfter,
        analysis:report.analysis,
        executionSummary:report.executionSummary,
        recoveryStatus:report.recoveryStatus,
        observedMetricChanges:report.observedMetricChanges,
        resilienceObservations:report.resilienceObservations,
        createdAt:report.createdAt.toISOString()
    }
}

async function save(report){
    const saved=await prisma.report.upsert({
        where:{executionId:report.executionId},
        update:{
            experimentId:report.experimentId,
            experiment:report.experiment,
            execution:report.execution,
            resultSnapshot:report.result,
            metricsBefore:report.metricsBefore,
            metricsAfter:report.metricsAfter,
            analysis:report.analysis,
            executionSummary:report.executionSummary,
            recoveryStatus:report.recoveryStatus,
            observedMetricChanges:report.observedMetricChanges,
            resilienceObservations:report.resilienceObservations,
            createdAt:report.createdAt
        },
        create:{
            executionId:report.executionId,
            experimentId:report.experimentId,
            experiment:report.experiment,
            execution:report.execution,
            resultSnapshot:report.result,
            metricsBefore:report.metricsBefore,
            metricsAfter:report.metricsAfter,
            analysis:report.analysis,
            executionSummary:report.executionSummary,
            recoveryStatus:report.recoveryStatus,
            observedMetricChanges:report.observedMetricChanges,
            resilienceObservations:report.resilienceObservations,
            createdAt:report.createdAt
        }
    })
    return toDomain(saved)
}

async function list(){
    const reports=await prisma.report.findMany({
        orderBy:{createdAt:"asc"}
    })
    return reports.map(toDomain)
}

async function getById(id){
    const report=await prisma.report.findUnique({
        where:{executionId:id}
    })
    return toDomain(report)
}

module.exports={save,list,getById}
