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

async function stressCpu(podName,namespace="default"){

const exec=new k8s.Exec(kc)

await exec.exec(
namespace,
podName,
"api-service",
["sh","-c","yes > /dev/null & sleep 15; kill $!"],
process.stdout,
process.stderr,
null,
false
)

}

module.exports={listPods,deletePod,stressCpu}