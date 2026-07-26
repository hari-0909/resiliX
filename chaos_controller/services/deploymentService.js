const k8s=require("@kubernetes/client-node")

const kc=new k8s.KubeConfig()
kc.loadFromDefault()

const appsApi=kc.makeApiClient(k8s.AppsV1Api)
const coreApi=kc.makeApiClient(k8s.CoreV1Api)

async function deployService(name,image,replicas=1){
    const namespace="default"
    const deployment={
        apiVersion:"apps/v1",
        kind:"Deployment",
        metadata:{name},
        spec:{
            replicas,
            selector:{matchLabels:{app:name}},
            template:{
                metadata:{labels:{app:name}},
                spec:{
                    containers:[{
                        name,
                        image,
                        ports:[{containerPort:80}]
                    }]
                }
            }
        }
    }
    await appsApi.createNamespacedDeployment({
        namespace,
        body:deployment
    })
    const service={
        apiVersion:"v1",
        kind:"Service",
        metadata:{name},
        spec:{
            selector:{app:name},
            ports:[{
                port:80,
                targetPort:80
            }],
            type:"ClusterIP"
        }
    }
    await coreApi.createNamespacedService({
    namespace,
    body:service
    })
}

module.exports={deployService}