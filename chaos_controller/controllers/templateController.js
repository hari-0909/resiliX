const {
    createTemplate,
    updateTemplate,
    listTemplates,
    getTemplate,
    deleteTemplate,
    runTemplate,
    scheduleTemplate,
    getSchedule,
    deleteSchedule
}=require("../services/templateService")

async function getTemplates(req,res){
    res.json(await listTemplates())
}

async function getTemplateById(req,res){
    const template=await getTemplate(req.params.id)
    if(!template){
        return res.status(404).json({error:"template not found"})
    }
    res.json(template)
}

async function postTemplate(req,res){
    const result=await createTemplate(req.body)
    if(result.error){
        return res.status(400).json({error:result.error})
    }
    res.status(201).json(result.template)
}

async function putTemplate(req,res){
    const result=await updateTemplate(req.params.id,req.body)
    if(result.notFound){
        return res.status(404).json({error:"template not found"})
    }
    if(result.error){
        return res.status(400).json({error:result.error})
    }
    res.json(result.template)
}

async function removeTemplate(req,res){
    const template=await deleteTemplate(req.params.id)
    if(!template){
        return res.status(404).json({error:"template not found"})
    }
    res.status(204).send()
}

async function runTemplateById(req,res){
    const result=await runTemplate(req.params.id)
    if(result.notFound){
        return res.status(404).json({error:"template not found"})
    }
    if(result.error){
        return res.status(400).json({error:result.error})
    }

    res.status(202).json({
        message:`template ${result.template.id} execution queued`,
        status:"queued",
        templateId:result.template.id,
        experimentId:result.experiment.id,
        executionId:result.execution.id
    })
}

async function postTemplateSchedule(req,res){
    const result=await scheduleTemplate(req.params.id,req.body)
    if(result.notFound){
        return res.status(404).json({error:"template not found"})
    }
    if(result.error){
        return res.status(400).json({error:result.error})
    }
    res.status(201).json(result.schedule)
}

async function getTemplateSchedule(req,res){
    const result=await getSchedule(req.params.id)
    if(result.notFound){
        return res.status(404).json({error:"template not found"})
    }
    if(!result.schedule){
        return res.status(404).json({error:"template schedule not found"})
    }
    res.json(result.schedule)
}

async function deleteTemplateSchedule(req,res){
    const result=await deleteSchedule(req.params.id)
    if(result.notFound){
        return res.status(404).json({error:"template not found"})
    }
    res.status(204).send()
}

module.exports={
    getTemplates,
    getTemplateById,
    postTemplate,
    putTemplate,
    removeTemplate,
    runTemplateById,
    postTemplateSchedule,
    getTemplateSchedule,
    deleteTemplateSchedule
}
