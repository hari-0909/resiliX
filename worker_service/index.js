const {createClient}=require("redis")
const k8s=require("@kubernetes/client-node")
const redis=createClient({url:"redis://localhost:6379"})
redis.connect().catch(()=>{})

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

async function runChaos(service){
    try{
        const pods=await listPods()
        const targetPod=pods.find(pod =>
        pod.metadata.name.startsWith(service) &&
        pod.status.phase==="Running"
        )
        if(!targetPod){
            console.log("no pod found for",service)
            return
        }
        await deletePod(targetPod.metadata.name)
        console.log("worker killed",targetPod.metadata.name)
    }catch(err){
        console.error("worker error",err)
    }
}
async function startWorker(){
    while(true){
        try{
            const job=await redis.brPop("chaos_queue",0)
            if(job){
                const {service}=JSON.parse(job.element)
                await runChaos(service)
            }
        }catch(err){
            console.error("queue error",err)
        }
    }
}
startWorker()