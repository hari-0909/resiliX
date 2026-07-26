const {createClient}=require("redis")
const CHAOS_QUEUE="chaos_queue"
const redisUrl=process.env.REDIS_URL||"redis://localhost:6379"
const redis=createClient({url:redisUrl})
let connectPromise
redis.on("error",(err)=>{
    console.error("redis queue error",err)
})
async function getRedisClient(){
    if(redis.isOpen){
        return redis
    }
    if(!connectPromise){
        connectPromise=redis.connect().catch(err=>{
            connectPromise=undefined
            throw err
        })
    }
    await connectPromise
    connectPromise=undefined
    return redis
}
function createExecutionMessage(executionType,service,namespace="default",source="manual",metadata={}){
    return {
        messageType:"execution",
        executionType,
        experimentId:metadata.experimentId,
        executionId:metadata.executionId,
        metricsBefore:metadata.metricsBefore,
        service,
        target:{
            service,
            namespace
        },
        source,
        createdAt:new Date().toISOString()
    }
}
async function enqueueExecutionMessage(message){
    const client=await getRedisClient()
    await client.lPush(CHAOS_QUEUE,JSON.stringify(message))
}
async function enqueuePodDelete(service,namespace="default",source="manual",metadata={}){
    const message=createExecutionMessage("pod_delete",service,namespace,source,metadata)
    await enqueueExecutionMessage(message)
}
async function enqueueCpuStress(service,namespace="default",source="manual",metadata={}){
    const message=createExecutionMessage("cpu_stress",service,namespace,source,metadata)
    await enqueueExecutionMessage(message)
}
async function enqueueMemoryStress(service,namespace="default",source="manual",metadata={}){
    const message=createExecutionMessage("memory_stress",service,namespace,source,metadata)
    await enqueueExecutionMessage(message)
}
module.exports={enqueuePodDelete,enqueueCpuStress,enqueueMemoryStress,CHAOS_QUEUE}
