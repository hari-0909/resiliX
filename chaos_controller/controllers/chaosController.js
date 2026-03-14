const {listPods,deletePod}=require("../services/kubeService")

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

module.exports={killApiPod,killRedis}