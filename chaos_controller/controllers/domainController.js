const {listExperiments,getExperiment}=require("../services/experimentService")
const {listExecutions,getExecution}=require("../services/executionService")
const {listResults,getResult}=require("../services/resultService")
const {listReports,getReport}=require("../services/reportService")

async function getExperiments(req,res){
    res.json(await listExperiments())
}

async function getExperimentById(req,res){
    const experiment=await getExperiment(req.params.id)
    if(!experiment){
        return res.status(404).json({error:"experiment not found"})
    }
    res.json(experiment)
}

async function getExecutions(req,res){
    res.json(await listExecutions())
}

async function getExecutionById(req,res){
    const execution=await getExecution(req.params.id)
    if(!execution){
        return res.status(404).json({error:"execution not found"})
    }
    res.json(execution)
}

async function getResults(req,res){
    res.json(await listResults())
}

async function getResultById(req,res){
    const result=await getResult(req.params.id)
    if(!result){
        return res.status(404).json({error:"result not found"})
    }
    res.json(result)
}

async function getReports(req,res){
    res.json(await listReports())
}

async function getReportById(req,res){
    const report=await getReport(req.params.id)
    if(!report){
        return res.status(404).json({error:"report not found"})
    }
    res.json(report)
}

module.exports={
    getExperiments,
    getExperimentById,
    getExecutions,
    getExecutionById,
    getResults,
    getResultById,
    getReports,
    getReportById
}
