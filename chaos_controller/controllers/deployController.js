const {deployService}=require("../services/deploymentService")

async function deployMicroservice(req,res){
    try{
        const {name,image,replicas}=req.body
        if(!name||!image){
            return res.status(400).json({error:"name and image required"})
        }
        await deployService(name,image,replicas||1)
        res.json({
            message:`service ${name} deployed successfully`
        })
    }catch(err){
        console.error(err)
        res.status(500).json({error:"deployment failed"})
    }
}

module.exports={deployMicroservice}