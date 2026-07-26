const {listPods,deletePod}=require("../services/kubeService")

async function handlePodDelete(message){
    const {service,namespace="default"}=message
    const pods=await listPods(namespace)
    const targetPod=pods.find(pod =>
    pod.metadata.name.startsWith(service) &&
    pod.status.phase==="Running"
    )
    if(!targetPod){
        console.log("no pod found for",service)
        return
    }
    await deletePod(targetPod.metadata.name,namespace)
    console.log("worker killed",targetPod.metadata.name)
}

module.exports={handlePodDelete}
