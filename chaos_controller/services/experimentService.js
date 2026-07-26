const {randomUUID}=require("crypto")
const experimentRepository=require("../repositories/experimentRepository")

async function createExperiment({chaosType,target,mode}){
    const experiment={
        id:randomUUID(),
        chaosType,
        target,
        mode,
        createdAt:new Date().toISOString()
    }
    return experimentRepository.save(experiment)
}

function listExperiments(){
    return experimentRepository.list()
}

function getExperiment(id){
    return experimentRepository.getById(id)
}

module.exports={createExperiment,listExperiments,getExperiment}
