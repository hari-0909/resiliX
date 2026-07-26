const {createExperiment}=require("./experimentService")
const {createExecution,markQueued}=require("./executionService")
const {enqueuePodDelete,enqueueCpuStress,enqueueMemoryStress}=require("./queueService")
const {captureMetricsSnapshot}=require("./prometheusService")

async function createPodDeleteExperiment(service,namespace="default",mode="manual"){
    return createExperiment({
        chaosType:"pod_delete",
        target:{
            service,
            namespace
        },
        mode
    })
}

async function queuePodDeleteExecution(experiment,source="manual"){
    const execution=await createExecution({
        experimentId:experiment.id,
        source
    })

    const metricsBefore=await captureMetricsSnapshot(experiment.target)

    await enqueuePodDelete(
        experiment.target.service,
        experiment.target.namespace,
        source,
        {
            experimentId:experiment.id,
            executionId:execution.id,
            metricsBefore
        }
    )

    await markQueued(execution.id)
    return execution
}

async function createCpuStressExperiment(service,namespace="default",mode="manual"){
    return createExperiment({
        chaosType:"cpu_stress",
        target:{
            service,
            namespace
        },
        mode
    })
}

async function queueCpuStressExecution(experiment,source="manual"){
    const execution=await createExecution({
        experimentId:experiment.id,
        source
    })

    const metricsBefore=await captureMetricsSnapshot(experiment.target)

    await enqueueCpuStress(
        experiment.target.service,
        experiment.target.namespace,
        source,
        {
            experimentId:experiment.id,
            executionId:execution.id,
            metricsBefore
        }
    )

    await markQueued(execution.id)
    return execution
}

async function createMemoryStressExperiment(service,namespace="default",mode="manual"){
    return createExperiment({
        chaosType:"memory_stress",
        target:{
            service,
            namespace
        },
        mode
    })
}

async function queueMemoryStressExecution(experiment,source="manual"){
    const execution=await createExecution({
        experimentId:experiment.id,
        source
    })

    const metricsBefore=await captureMetricsSnapshot(experiment.target)

    await enqueueMemoryStress(
        experiment.target.service,
        experiment.target.namespace,
        source,
        {
            experimentId:experiment.id,
            executionId:execution.id,
            metricsBefore
        }
    )

    await markQueued(execution.id)
    return execution
}

module.exports={
    createPodDeleteExperiment,
    queuePodDeleteExecution,
    createCpuStressExperiment,
    queueCpuStressExecution,
    createMemoryStressExperiment,
    queueMemoryStressExecution
}
