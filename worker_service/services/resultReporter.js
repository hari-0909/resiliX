const {createClient}=require("redis")

const RESULT_QUEUE="execution_result_queue"
const redis=createClient({url:"redis://localhost:6379"})
let connectPromise

redis.on("error",(err)=>{
    console.error("redis result reporter error",err)
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

async function reportResult(result){
    try{
        const client=await getRedisClient()
        await client.lPush(RESULT_QUEUE,JSON.stringify(result))
    }catch(err){
        console.error("result report error",err)
    }
}

module.exports={reportResult}
