const {
    getNamespaces,
    getDeployments,
    getServices,
    getPods
}=require("../services/clusterService")

async function listClusterNamespaces(req,res){
    try{
        res.json(await getNamespaces())
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch namespaces"})
    }
}

async function listNamespaceDeployments(req,res){
    try{
        res.json(await getDeployments(req.params.namespace))
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch deployments"})
    }
}

async function listNamespaceServices(req,res){
    try{
        res.json(await getServices(req.params.namespace))
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch services"})
    }
}

async function listNamespacePods(req,res){
    try{
        res.json(await getPods(req.params.namespace))
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch pods"})
    }
}

module.exports={
    listClusterNamespaces,
    listNamespaceDeployments,
    listNamespaceServices,
    listNamespacePods
}
