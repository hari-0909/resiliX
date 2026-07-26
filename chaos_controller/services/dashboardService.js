const {listExperiments}=require("./experimentService")
const {listExecutions}=require("./executionService")
const {listResults}=require("./resultService")
const {listReports}=require("./reportService")
const {listTemplates}=require("./templateService")
const {listAnalyses}=require("./analysisService")
const {
    getNamespaces,
    getDeployments,
    getServices,
    getPods
}=require("./clusterService")

const recentLimit=5

function newestFirst(items,timestampField){
    return [...items].sort((left,right)=>{
        return new Date(right[timestampField]).getTime()-new Date(left[timestampField]).getTime()
    })
}

function takeRecent(items,timestampField,limit=recentLimit){
    return newestFirst(items,timestampField).slice(0,limit)
}

function activeScheduleCount(templates){
    return templates.filter(template=>template.scheduleStatus==="active").length
}

async function getOverview(){
    const [templates,experiments,executions,results,reports]=await Promise.all([
        listTemplates(),
        listExperiments(),
        listExecutions(),
        listResults(),
        listReports()
    ])

    return {
        totalTemplates:templates.length,
        totalExperiments:experiments.length,
        totalExecutions:executions.length,
        successfulExecutions:results.filter(result=>result.status==="succeeded").length,
        failedExecutions:results.filter(result=>result.status==="failed").length,
        activeSchedules:activeScheduleCount(templates),
        totalReports:reports.length
    }
}

async function getRecent(){
    const [executions,reports,analyses]=await Promise.all([
        listExecutions(),
        listReports(),
        listAnalyses()
    ])

    return {
        latestExecutions:takeRecent(executions,"createdAt"),
        latestReports:takeRecent(reports,"createdAt"),
        latestAnalyses:takeRecent(analyses,"createdAt")
    }
}

async function getCluster(){
    const namespaces=await getNamespaces()
    const namespaceNames=namespaces.map(namespace=>namespace.name)

    const namespaceResources=await Promise.all(
        namespaceNames.map(async(namespace)=>{
            const [deployments,services,pods]=await Promise.all([
                getDeployments(namespace),
                getServices(namespace),
                getPods(namespace)
            ])

            return {
                namespace,
                deployments,
                services,
                pods
            }
        })
    )

    return {
        namespaces,
        deployments:namespaceResources.flatMap(resource=>resource.deployments),
        services:namespaceResources.flatMap(resource=>resource.services),
        pods:namespaceResources.flatMap(resource=>resource.pods)
    }
}

async function getReportSummaries(){
    const reports=await listReports()

    return newestFirst(reports,"createdAt").map(report=>({
        executionId:report.executionId,
        experimentId:report.experimentId,
        executionSummary:report.executionSummary,
        recoveryStatus:report.recoveryStatus,
        resilienceObservations:report.resilienceObservations,
        createdAt:report.createdAt
    }))
}

module.exports={
    getOverview,
    getRecent,
    getCluster,
    getReportSummaries
}
