const {listPods,stressCpu}=require("../services/kubeService")

async function handleCpuStress(message){
    const {service,namespace="default"}=message
    const pods=await listPods(namespace)
    const targetPod=pods.find(pod =>
    pod.metadata.name.startsWith(service) &&
    pod.status.phase==="Running"
    )
    if(!targetPod){
        throw new Error(`no pod found for ${service}`)
    }
    await stressCpu(targetPod.metadata.name,namespace,service)
    console.log("worker stressed cpu on",targetPod.metadata.name)
}

module.exports={handleCpuStress}
