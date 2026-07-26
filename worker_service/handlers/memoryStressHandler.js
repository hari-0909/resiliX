const {listPods,stressMemory}=require("../services/kubeService")

async function handleMemoryStress(message){
    const {service,namespace="default"}=message
    const pods=await listPods(namespace)
    const targetPod=pods.find(pod =>
    pod.metadata.name.startsWith(service) &&
    pod.status.phase==="Running"
    )
    if(!targetPod){
        throw new Error(`no pod found for ${service}`)
    }
    await stressMemory(targetPod.metadata.name,namespace,service)
    console.log("worker stressed memory on",targetPod.metadata.name)
}

module.exports={handleMemoryStress}
