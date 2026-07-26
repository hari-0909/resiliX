const {listPods,deletePod,addNetworkDelay}=require("../services/kubeService")
const {
    createCpuStressExperiment,
    queueCpuStressExecution,
    createMemoryStressExperiment,
    queueMemoryStressExecution
}=require("../services/podDeleteExecutionService")

async function killApiPod(req,res){
    try{
        const pods=await listPods("default")
        const apiPod=pods.find(pod=>pod.metadata.name.startsWith("api-service"))
        if(!apiPod){
            return res.status(404).json({error:"api pod not found"})
        }
        const podName=apiPod.metadata.name
        await deletePod(podName,"default")
        res.json({message:`api pod ${podName} deleted`})
    }catch(err){
        console.error(err)
        res.status(500).json({error:"chaos experiment failed"})
    }
}

async function killRedis(req,res){
    try{
        const pods=await listPods("default")
        const redisPod=pods.find(pod=>pod.metadata.name.startsWith("redis"))
        if(!redisPod){
            return res.status(404).json({error:"redis pod not found"})
        }
        const podName=redisPod.metadata.name
        await deletePod(podName,"default")
        res.json({message:`redis pod ${podName} deleted`})
    }catch(err){
        console.error(err)
        res.status(500).json({error:"redis chaos failed"})
    }
}

async function cpuStress(req,res){
    try{
        const service=req.body?.service||"api-service"
        const namespace=req.body?.namespace||"default"
        const experiment=await createCpuStressExperiment(service,namespace)
        const execution=await queueCpuStressExecution(experiment)
        res.status(202).json({
            message:`cpu stress execution queued for ${service}`,
            status:"queued",
            experimentId:experiment.id,
            executionId:execution.id
        })
    }catch(err){
        console.error(err)
        res.status(500).json({error:"cpu chaos failed"})
    }
}

async function memoryStress(req,res){
    try{
        const service=req.body?.service||"api-service"
        const namespace=req.body?.namespace||"default"
        const experiment=await createMemoryStressExperiment(service,namespace)
        const execution=await queueMemoryStressExecution(experiment)
        res.status(202).json({
            message:`memory stress execution queued for ${service}`,
            status:"queued",
            experimentId:experiment.id,
            executionId:execution.id
        })
    }catch(err){
        console.error(err)
        res.status(500).json({error:"memory chaos failed"})
    }
}

async function networkDelay(req,res){
    try{
        const pods=await listPods("default")
        const apiPod=pods.find(pod=>pod.metadata.name.startsWith("api-service"))
        if(!apiPod){
            return res.status(404).json({error:"api pod not found"})
        }
        const podName=apiPod.metadata.name
        await addNetworkDelay(podName,"default")
        res.json({message:`network delay injected on ${podName}`})
    }catch(err){
        console.error(err)
        res.status(500).json({error:"network chaos failed"})
    }
}

module.exports={killApiPod,killRedis,cpuStress,memoryStress,networkDelay}
