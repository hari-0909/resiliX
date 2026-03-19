const {listPods,deletePod}=require("../services/kubeService")

const activeSchedules={}

async function scheduleChaos(req,res){

try{

const {service,interval}=req.body

if(!service||!interval){
return res.status(400).json({error:"service and interval required"})
}

if(activeSchedules[service]){
return res.json({message:"schedule already running"})
}

const job=setInterval(async()=>{

try{

const pods=await listPods()

const targetPod=pods.find(pod =>
pod.metadata.name.startsWith(service)
)

if(targetPod){
await deletePod(targetPod.metadata.name)
console.log(`scheduled chaos killed ${targetPod.metadata.name}`)
}

}catch(err){
console.log("scheduler error",err)
}

},interval*1000)

activeSchedules[service]=job

res.json({
message:`chaos scheduled for ${service} every ${interval}s`
})

}catch(err){

console.error(err)
res.status(500).json({error:"scheduler failed"})

}

}

function stopSchedule(req,res){

try{

const {service}=req.body

if(!service){
return res.status(400).json({error:"service required"})
}

const job=activeSchedules[service]

if(!job){
return res.status(404).json({error:"no active schedule"})
}

clearInterval(job)

delete activeSchedules[service]

res.json({
message:`scheduler stopped for ${service}`
})

}catch(err){

console.error(err)
res.status(500).json({error:"stop scheduler failed"})

}

}

module.exports={scheduleChaos,stopSchedule}