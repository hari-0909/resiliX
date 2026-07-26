const k8s=require("@kubernetes/client-node")

const kc=new k8s.KubeConfig()
kc.loadFromDefault()

const k8sApi=kc.makeApiClient(k8s.CoreV1Api)
const exec=new k8s.Exec(kc)

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

async function stressCpu(podName,namespace="default",containerName="api-service"){
    await exec.exec(
        namespace,
        podName,
        containerName,
        ["sh","-c","yes > /dev/null & sleep 15; kill $!"],
        process.stdout,
        process.stderr,
        null,
        false
    )
}

async function stressMemory(podName,namespace="default",containerName="api-service"){
    await exec.exec(
        namespace,
        podName,
        containerName,
        ["sh","-c","node -e \"const blocks=[]; blocks.push(Buffer.alloc(128*1024*1024)); setTimeout(()=>{},15000)\""],
        process.stdout,
        process.stderr,
        null,
        false
    )
}

module.exports={listPods,deletePod,stressCpu,stressMemory}
