const k8s=require("@kubernetes/client-node")

const kc=new k8s.KubeConfig()
kc.loadFromDefault()

const k8sApi=kc.makeApiClient(k8s.CoreV1Api)

async function listPods(namespace="default"){
const res=await k8sApi.listNamespacedPod({namespace})
return res.items
}

async function deletePod(podName,namespace="default"){
await k8sApi.deleteNamespacedPod({
name:podName,
namespace
})
}

module.exports={listPods,deletePod}