const {listPods,deletePod}=require("../services/kubeService")

async function killServicePod(req,res){

try{

const {service}=req.body

if(!service){
return res.status(400).json({error:"service name required"})
}

const pods=await listPods()

const targetPod=pods.find(pod =>
pod.metadata.name.startsWith(service)
)

if(!targetPod){
return res.status(404).json({error:"service pod not found"})
}

const podName=targetPod.metadata.name

await deletePod(podName)

res.json({
message:`pod ${podName} killed`
})

}catch(err){

console.error(err)
res.status(500).json({error:"service chaos failed"})

}

}

module.exports={killServicePod}