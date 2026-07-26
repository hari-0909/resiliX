const {createPodDeleteExperiment,queuePodDeleteExecution}=require("../services/podDeleteExecutionService")
async function killServicePod(req,res){
    try{
        const {service}=req.body
        if(!service){
            return res.status(400).json({error:"service name required"})
        }
        const experiment=await createPodDeleteExperiment(service)
        const execution=await queuePodDeleteExecution(experiment)
        res.status(202).json({
            message:`chaos execution queued for ${service}`,
            status:"queued",
            experimentId:experiment.id,
            executionId:execution.id
        })
    }catch(err){
        console.error(err)
        res.status(500).json({error:"service chaos failed"})
    }
}

module.exports={killServicePod}
