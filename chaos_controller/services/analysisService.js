const analysisRepository=require("../repositories/analysisRepository")

const metrics=[
    {field:"cpuUsage",delta:"cpuDelta",label:"CPU"},
    {field:"memoryUsage",delta:"memoryDelta",label:"memory"},
    {field:"requestLatency",delta:"latencyDelta",label:"latency"},
    {field:"errorRate",delta:"errorRateDelta",label:"error rate"},
    {field:"podRestartCount",delta:"podRestartDelta",label:"pod restarts"}
]

function numericValue(value){
    return typeof value==="number"&&Number.isFinite(value)?value:null
}

function calculateDelta(before,after,field){
    const beforeValue=numericValue(before?.[field])
    const afterValue=numericValue(after?.[field])

    if(beforeValue===null||afterValue===null){
        return null
    }

    return afterValue-beforeValue
}

function formatDelta(value){
    if(value===null){
        return "unavailable"
    }

    if(value===0){
        return "unchanged"
    }

    return value>0?`increased by ${value}`:`decreased by ${Math.abs(value)}`
}

function buildSummary(analysis){
    const parts=metrics.map(metric=>`${metric.label} ${formatDelta(analysis[metric.delta])}`)
    return `Execution ${analysis.executionId} completed with ${parts.join(", ")}.`
}

async function createAnalysis(result){
    const analysis={
        executionId:result.executionId,
        experimentId:result.experimentId,
        createdAt:new Date().toISOString()
    }

    for(const metric of metrics){
        analysis[metric.delta]=calculateDelta(result.metricsBefore,result.metricsAfter,metric.field)
    }

    analysis.summary=buildSummary(analysis)

    return analysisRepository.save(analysis)
}

function listAnalyses(){
    return analysisRepository.list()
}

module.exports={createAnalysis,listAnalyses}
