const reportRepository=require("../repositories/reportRepository")
const experimentRepository=require("../repositories/experimentRepository")
const executionRepository=require("../repositories/executionRepository")

const metricLabels={
    cpuDelta:"CPU",
    memoryDelta:"memory",
    latencyDelta:"latency",
    errorRateDelta:"error rate",
    podRestartDelta:"pod restarts"
}

function formatMetricChange(value){
    if(value===null||value===undefined){
        return "unavailable"
    }

    if(value===0){
        return "unchanged"
    }

    return value>0?`increased by ${value}`:`decreased by ${Math.abs(value)}`
}

function buildObservedMetricChanges(analysis){
    return Object.entries(metricLabels).reduce((changes,[field,label])=>{
        changes[field]={
            label,
            delta:analysis[field],
            description:`${label} ${formatMetricChange(analysis[field])}`
        }
        return changes
    },{})
}

function buildRecoveryStatus(result){
    return result.status==="succeeded"?"recovered":"failed"
}

function buildExecutionSummary(experiment,execution,result){
    const chaosType=experiment?.chaosType||"unknown chaos"
    const mode=experiment?.mode||"unknown mode"
    return `${chaosType} execution ${execution.id} for experiment ${experiment.id} completed with status ${result.status} in ${mode} mode.`
}

function buildResilienceObservations(result,analysis){
    const observations=[]

    observations.push(result.status==="succeeded"?
        "The target completed the execution successfully.":
        `The execution failed: ${result.error||"unknown error"}.`
    )

    if(analysis.podRestartDelta>0){
        observations.push("Pod restart count increased after the execution.")
    }else if(analysis.podRestartDelta===0){
        observations.push("Pod restart count did not change after the execution.")
    }else{
        observations.push("Pod restart change was unavailable.")
    }

    if(analysis.errorRateDelta>0){
        observations.push("Application error rate increased after the execution.")
    }else if(analysis.errorRateDelta===0){
        observations.push("Application error rate did not change after the execution.")
    }else if(analysis.errorRateDelta<0){
        observations.push("Application error rate decreased after the execution.")
    }else{
        observations.push("Application error rate change was unavailable.")
    }

    if(analysis.latencyDelta>0){
        observations.push("Request latency increased after the execution.")
    }else if(analysis.latencyDelta===0){
        observations.push("Request latency did not change after the execution.")
    }else if(analysis.latencyDelta<0){
        observations.push("Request latency decreased after the execution.")
    }else{
        observations.push("Request latency change was unavailable.")
    }

    return observations
}

async function createReport(result,analysis){
    const [experiment,execution]=await Promise.all([
        experimentRepository.getById(result.experimentId),
        executionRepository.getById(result.executionId)
    ])

    if(!experiment){
        throw new Error(`experiment ${result.experimentId} not found for report generation`)
    }

    if(!execution){
        throw new Error(`execution ${result.executionId} not found for report generation`)
    }

    const report={
        executionId:result.executionId,
        experimentId:result.experimentId,
        experiment,
        execution,
        result:{
            executionId:result.executionId,
            experimentId:result.experimentId,
            status:result.status,
            error:result.error||null,
            startedAt:result.startedAt,
            completedAt:result.completedAt
        },
        metricsBefore:result.metricsBefore,
        metricsAfter:result.metricsAfter,
        analysis,
        executionSummary:buildExecutionSummary(experiment,execution,result),
        recoveryStatus:buildRecoveryStatus(result),
        observedMetricChanges:buildObservedMetricChanges(analysis),
        resilienceObservations:buildResilienceObservations(result,analysis),
        createdAt:new Date().toISOString()
    }

    return reportRepository.save(report)
}

function listReports(){
    return reportRepository.list()
}

function getReport(id){
    return reportRepository.getById(id)
}

module.exports={createReport,listReports,getReport}
