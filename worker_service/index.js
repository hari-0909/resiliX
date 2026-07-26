const {createClient}=require("redis")
const redis=createClient({url:"redis://localhost:6379"})
redis.connect().catch(()=>{})
const {handlePodDelete}=require("./handlers/podDeleteHandler")
const {handleCpuStress}=require("./handlers/cpuStressHandler")
const {handleMemoryStress}=require("./handlers/memoryStressHandler")
const {reportResult}=require("./services/resultReporter")

const executionHandlers={
    pod_delete:handlePodDelete,
    cpu_stress:handleCpuStress,
    memory_stress:handleMemoryStress
}

async function dispatchExecution(message){
    const handler=executionHandlers[message.executionType]

    if(!handler){
        throw new Error(`unsupported execution type ${message.executionType}`)
    }

    await handler(message)
}

function hasResultTarget(message){
    return Boolean(message.executionId&&message.experimentId)
}

async function reportExecutionSuccess(message,startedAt){
    if(!hasResultTarget(message)){
        return
    }

    await reportResult({
        executionId:message.executionId,
        experimentId:message.experimentId,
        target:{
            service:message.service,
            namespace:message.namespace
        },
        metricsBefore:message.metricsBefore,
        status:"succeeded",
        startedAt,
        completedAt:new Date().toISOString()
    })
}

async function reportExecutionFailure(message,err,startedAt){
    if(!hasResultTarget(message)){
        return
    }

    await reportResult({
        executionId:message.executionId,
        experimentId:message.experimentId,
        target:{
            service:message.service,
            namespace:message.namespace
        },
        metricsBefore:message.metricsBefore,
        status:"failed",
        error:err.message,
        startedAt,
        completedAt:new Date().toISOString()
    })
}

function parseExecutionMessage(job){
    const message=JSON.parse(job)

    if(message.messageType==="execution"&&message.executionType){
        return {
            executionType:message.executionType,
            experimentId:message.experimentId,
            executionId:message.executionId,
            metricsBefore:message.metricsBefore,
            service:message.target?.service,
            namespace:message.target?.namespace||"default"
        }
    }

    if(message.service){
        return {
            executionType:"pod_delete",
            experimentId:message.experimentId,
            executionId:message.executionId,
            metricsBefore:message.metricsBefore,
            service:message.service,
            namespace:"default"
        }
    }

    throw new Error("unsupported execution message")
}

async function startWorker(){
    while(true){
        try{
            const job=await redis.brPop("chaos_queue",0)
            if(job){
                const message=parseExecutionMessage(job.element)
                const startedAt=new Date().toISOString()
                try{
                    await dispatchExecution(message)
                    await reportExecutionSuccess(message,startedAt)
                }catch(err){
                    console.error("worker error",err)
                    await reportExecutionFailure(message,err,startedAt)
                }
            }
        }catch(err){
            console.error("queue error",err)
        }
    }
}
startWorker()
