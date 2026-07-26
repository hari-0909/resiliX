const {createClient}=require("redis")

const RESULT_QUEUE="execution_result_queue"
const redisUrl=process.env.REDIS_URL||"redis://localhost:6379"
const redis=createClient({url:redisUrl})
const resultRepository=require("../repositories/resultRepository")
const {captureMetricsSnapshot}=require("./prometheusService")
const {createAnalysis}=require("./analysisService")
const {createReport}=require("./reportService")
let connectPromise

function wait(ms){
    return new Promise(resolve=>setTimeout(resolve,ms))
}

redis.on("error",(err)=>{
    console.error("redis result error",err)
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

async function createResult(resultMessage){
    const metricsAfter=await captureMetricsSnapshot(resultMessage.target)
    const result={
        executionId:resultMessage.executionId,
        experimentId:resultMessage.experimentId,
        status:resultMessage.status,
        startedAt:resultMessage.startedAt,
        completedAt:resultMessage.completedAt,
        metricsBefore:resultMessage.metricsBefore,
        metricsAfter
    }

    if(resultMessage.error){
        result.error=resultMessage.error
    }

    const savedResult=await resultRepository.save(result)
    const analysis=await createAnalysis(savedResult)
    const report=await createReport(savedResult,analysis)

    return {
        ...savedResult,
        analysis,
        report
    }
}

function listResults(){
    return resultRepository.list()
}

function getResult(id){
    return resultRepository.getById(id)
}

async function startResultConsumer(){
    while(true){
        try{
            const client=await getRedisClient()
            const message=await client.brPop(RESULT_QUEUE,0)
            if(message){
                await createResult(JSON.parse(message.element))
            }
        }catch(err){
            console.error("result consumer error",err)
            await wait(1000)
        }
    }
}

module.exports={createResult,startResultConsumer,RESULT_QUEUE,listResults,getResult}
