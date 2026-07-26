const {randomUUID}=require("crypto")
const executionRepository=require("../repositories/executionRepository")

async function createExecution({experimentId,source}){
    const execution={
        id:randomUUID(),
        experimentId,
        status:"created",
        source,
        createdAt:new Date().toISOString(),
        queuedAt:null
    }
    return executionRepository.save(execution)
}

async function markQueued(executionId){
    const execution=await executionRepository.getById(executionId)
    if(!execution){
        return null
    }
    execution.status="queued"
    execution.queuedAt=new Date().toISOString()
    return executionRepository.save(execution)
}

function listExecutions(){
    return executionRepository.list()
}

function getExecution(id){
    return executionRepository.getById(id)
}

module.exports={createExecution,markQueued,listExecutions,getExecution}
