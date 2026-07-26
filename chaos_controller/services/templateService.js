const {randomUUID}=require("crypto")
const templateRepository=require("../repositories/templateRepository")
const {
    createPodDeleteExperiment,
    queuePodDeleteExecution,
    createCpuStressExperiment,
    queueCpuStressExecution,
    createMemoryStressExperiment,
    queueMemoryStressExecution
}=require("./podDeleteExecutionService")

const supportedExecutionTypes=new Set(["pod_delete","cpu_stress","memory_stress"])
const activeTemplateSchedules=new Map()
const maxTimerDelay=2147483647
const cronFieldRanges=[
    [0,59],
    [0,23],
    [1,31],
    [1,12],
    [0,6]
]

function validateTemplateInput(input){
    if(!input?.name){
        return "template name is required"
    }

    if(!input.executionType||!supportedExecutionTypes.has(input.executionType)){
        return "supported executionType is required"
    }

    if(!input.targetService){
        return "target service is required"
    }

    if(input.duration!==undefined&&input.duration!==null&&(!Number.isInteger(input.duration)||input.duration<0)){
        return "duration must be a non-negative integer"
    }

    if(input.parameters!==undefined&&input.parameters!==null&&(typeof input.parameters!=="object"||Array.isArray(input.parameters))){
        return "parameters must be an object"
    }

    return null
}

function templateFromInput(input,id=randomUUID(),createdAt=new Date().toISOString()){
    const now=new Date().toISOString()

    return {
        id,
        name:input.name,
        executionType:input.executionType,
        targetService:input.targetService,
        namespace:input.namespace||"default",
        duration:input.duration??null,
        parameters:input.parameters??null,
        createdAt,
        updatedAt:now
    }
}

async function createTemplate(input){
    const error=validateTemplateInput(input)
    if(error){
        return {error}
    }

    return {template:await templateRepository.save(templateFromInput(input))}
}

async function updateTemplate(id,input={}){
    const existing=await templateRepository.getById(id)
    if(!existing){
        return {notFound:true}
    }

    const nextInput={
        name:input.name??existing.name,
        executionType:input.executionType??existing.executionType,
        targetService:input.targetService??existing.targetService,
        namespace:input.namespace??existing.namespace,
        duration:input.duration===undefined?existing.duration:input.duration,
        parameters:input.parameters===undefined?existing.parameters:input.parameters
    }

    const error=validateTemplateInput(nextInput)
    if(error){
        return {error}
    }

    return {
        template:await templateRepository.save(
            templateFromInput(nextInput,existing.id,existing.createdAt)
        )
    }
}

function listTemplates(){
    return templateRepository.list()
}

function getTemplate(id){
    return templateRepository.getById(id)
}

async function deleteTemplate(id){
    const existing=await templateRepository.getById(id)
    if(!existing){
        return null
    }

    clearActiveSchedule(id)
    return templateRepository.remove(id)
}

async function runTemplate(id){
    const template=await templateRepository.getById(id)
    if(!template){
        return {notFound:true}
    }

    if(template.executionType==="pod_delete"){
        const experiment=await createPodDeleteExperiment(template.targetService,template.namespace)
        const execution=await queuePodDeleteExecution(experiment)
        return {template,experiment,execution}
    }

    if(template.executionType==="cpu_stress"){
        const experiment=await createCpuStressExperiment(template.targetService,template.namespace)
        const execution=await queueCpuStressExecution(experiment)
        return {template,experiment,execution}
    }

    if(template.executionType==="memory_stress"){
        const experiment=await createMemoryStressExperiment(template.targetService,template.namespace)
        const execution=await queueMemoryStressExecution(experiment)
        return {template,experiment,execution}
    }

    return {error:"unsupported executionType"}
}

function parseCronField(field,min,max){
    const values=new Set()

    for(const part of field.split(",")){
        const [range,stepValue]=part.split("/")
        const step=stepValue===undefined?1:Number(stepValue)
        if(!Number.isInteger(step)||step<1){
            return null
        }

        let start
        let end
        if(range==="*"){
            start=min
            end=max
        }else if(range.includes("-")){
            const [from,to]=range.split("-").map(Number)
            if(!Number.isInteger(from)||!Number.isInteger(to)||from>to){
                return null
            }
            start=from
            end=to
        }else{
            const value=Number(range)
            if(!Number.isInteger(value)){
                return null
            }
            start=value
            end=value
        }

        if(start<min||end>max){
            return null
        }

        for(let value=start;value<=end;value+=step){
            values.add(value)
        }
    }

    if(values.size===0){
        return null
    }

    return {matches:current=>values.has(current)}
}

function parseCronExpression(expression){
    const fields=String(expression||"").trim().split(/\s+/)
    if(fields.length!==5){
        return null
    }

    const parsed=fields.map((field,index)=>{
        const [min,max]=cronFieldRanges[index]
        return parseCronField(field,min,max)
    })

    if(parsed.some(field=>!field)){
        return null
    }

    return parsed
}

function cronMatches(parsed,date){
    return parsed[0].matches(date.getMinutes())&&
        parsed[1].matches(date.getHours())&&
        parsed[2].matches(date.getDate())&&
        parsed[3].matches(date.getMonth()+1)&&
        parsed[4].matches(date.getDay())
}

function nextCronRun(expression,after=new Date()){
    const parsed=parseCronExpression(expression)
    if(!parsed){
        return null
    }

    const candidate=new Date(after)
    candidate.setSeconds(0,0)
    candidate.setMinutes(candidate.getMinutes()+1)

    const maxMinutes=366*24*60
    for(let i=0;i<maxMinutes;i++){
        if(cronMatches(parsed,candidate)){
            return candidate
        }
        candidate.setMinutes(candidate.getMinutes()+1)
    }

    return null
}

function clearActiveSchedule(templateId){
    const active=activeTemplateSchedules.get(templateId)
    if(active){
        clearTimeout(active.timer)
        activeTemplateSchedules.delete(templateId)
    }
}

function scheduleTimer(templateId,runAt,afterRun){
    const delay=Math.max(0,runAt.getTime()-Date.now())
    const timer=setTimeout(async()=>{
        if(runAt.getTime()>Date.now()){
            scheduleTimer(templateId,runAt,afterRun)
            return
        }

        activeTemplateSchedules.delete(templateId)
        try{
            await runTemplate(templateId)
        }catch(err){
            console.error("template schedule execution failed",err)
        }

        if(afterRun){
            try{
                await afterRun()
            }catch(err){
                console.error("template schedule update failed",err)
            }
        }
    },Math.min(delay,maxTimerDelay))

    activeTemplateSchedules.set(templateId,{timer,runAt:runAt.toISOString()})
}

function startTemplateSchedule(template){
    clearActiveSchedule(template.id)

    if(template.scheduleMode==="once"&&template.scheduledAt){
        const runAt=new Date(template.scheduledAt)
        if(Number.isNaN(runAt.getTime())||runAt.getTime()<=Date.now()){
            return false
        }

        scheduleTimer(template.id,runAt,async()=>{
            const latest=await templateRepository.getById(template.id)
            if(latest?.scheduleMode==="once"){
                await templateRepository.save({
                    ...latest,
                    scheduleStatus:"completed",
                    updatedAt:new Date().toISOString()
                })
            }
        })
        return true
    }

    if(template.scheduleMode==="cron"&&template.cronExpression){
        const nextRun=nextCronRun(template.cronExpression)
        if(!nextRun){
            return false
        }

        scheduleTimer(template.id,nextRun,async()=>{
            const latest=await templateRepository.getById(template.id)
            if(latest?.scheduleMode==="cron"&&latest.scheduleStatus==="active"){
                startTemplateSchedule(latest)
            }
        })
        return true
    }

    return false
}

async function scheduleTemplate(id,input){
    const template=await templateRepository.getById(id)
    if(!template){
        return {notFound:true}
    }

    const mode=input?.mode
    if(mode==="once"){
        const runAt=new Date(input.scheduledAt)
        if(!input.scheduledAt||Number.isNaN(runAt.getTime())||runAt.getTime()<=Date.now()){
            return {error:"future scheduledAt is required"}
        }

        const scheduled=await templateRepository.save({
            ...template,
            scheduleMode:"once",
            scheduledAt:runAt.toISOString(),
            cronExpression:null,
            scheduleStatus:"active",
            updatedAt:new Date().toISOString()
        })

        startTemplateSchedule(scheduled)
        return {schedule:getTemplateSchedule(scheduled)}
    }

    if(mode==="cron"){
        if(!nextCronRun(input.cronExpression)){
            return {error:"valid cronExpression is required"}
        }

        const scheduled=await templateRepository.save({
            ...template,
            scheduleMode:"cron",
            scheduledAt:null,
            cronExpression:input.cronExpression,
            scheduleStatus:"active",
            updatedAt:new Date().toISOString()
        })

        startTemplateSchedule(scheduled)
        return {schedule:getTemplateSchedule(scheduled)}
    }

    return {error:"mode must be once or cron"}
}

function getTemplateSchedule(template){
    return {
        templateId:template.id,
        mode:template.scheduleMode,
        scheduledAt:template.scheduledAt,
        cronExpression:template.cronExpression,
        status:template.scheduleStatus,
        nextRunAt:activeTemplateSchedules.get(template.id)?.runAt||null
    }
}

async function getSchedule(id){
    const template=await templateRepository.getById(id)
    if(!template){
        return {notFound:true}
    }

    if(!template.scheduleMode){
        return {schedule:null}
    }

    return {schedule:getTemplateSchedule(template)}
}

async function deleteSchedule(id){
    const template=await templateRepository.getById(id)
    if(!template){
        return {notFound:true}
    }

    clearActiveSchedule(id)

    const updated=await templateRepository.save({
        ...template,
        scheduleMode:null,
        scheduledAt:null,
        cronExpression:null,
        scheduleStatus:null,
        updatedAt:new Date().toISOString()
    })

    return {schedule:getTemplateSchedule(updated)}
}

module.exports={
    createTemplate,
    updateTemplate,
    listTemplates,
    getTemplate,
    deleteTemplate,
    runTemplate,
    scheduleTemplate,
    getSchedule,
    deleteSchedule
}
