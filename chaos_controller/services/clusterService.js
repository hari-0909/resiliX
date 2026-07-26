const {
    listNamespaces,
    listDeployments,
    listServices,
    listPods
}=require("./kubeService")

function labelsFor(resource){
    return resource.metadata?.labels||{}
}

function namespaceFor(resource){
    return resource.metadata?.namespace||null
}

function mapNamespace(namespace){
    return {
        name:namespace.metadata.name,
        labels:labelsFor(namespace),
        status:namespace.status?.phase||null
    }
}

function mapDeployment(deployment){
    return {
        name:deployment.metadata.name,
        namespace:namespaceFor(deployment),
        labels:labelsFor(deployment),
        replicas:{
            desired:deployment.spec?.replicas??0,
            ready:deployment.status?.readyReplicas??0,
            available:deployment.status?.availableReplicas??0,
            updated:deployment.status?.updatedReplicas??0
        }
    }
}

function mapService(service){
    return {
        name:service.metadata.name,
        namespace:namespaceFor(service),
        labels:labelsFor(service),
        type:service.spec?.type||null,
        clusterIP:service.spec?.clusterIP||null,
        ports:(service.spec?.ports||[]).map(port=>({
            name:port.name||null,
            port:port.port,
            targetPort:port.targetPort||null,
            protocol:port.protocol||null
        }))
    }
}

function mapPod(pod){
    return {
        name:pod.metadata.name,
        namespace:namespaceFor(pod),
        labels:labelsFor(pod),
        phase:pod.status?.phase||null,
        nodeName:pod.spec?.nodeName||null,
        containers:(pod.spec?.containers||[]).map(container=>({
            name:container.name,
            image:container.image
        }))
    }
}

async function getNamespaces(){
    const namespaces=await listNamespaces()
    return namespaces.map(mapNamespace)
}

async function getDeployments(namespace){
    const deployments=await listDeployments(namespace)
    return deployments.map(mapDeployment)
}

async function getServices(namespace){
    const services=await listServices(namespace)
    return services.map(mapService)
}

async function getPods(namespace){
    const pods=await listPods(namespace)
    return pods.map(mapPod)
}

module.exports={
    getNamespaces,
    getDeployments,
    getServices,
    getPods
}
