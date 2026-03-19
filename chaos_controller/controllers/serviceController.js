const {listDeployments}=require("../services/kubeService")

async function getServices(req,res){

try{

const deployments=await listDeployments()

const serviceNames=deployments.map(d=>d.metadata.name)

res.json(serviceNames)

}catch(err){

console.error(err)
res.status(500).json({error:"failed to fetch services"})

}

}

module.exports={getServices}