const prometheusUrl=process.env.PROMETHEUS_URL||"http://prometheus:9090"
const prometheusTimeoutMs=Number(process.env.PROMETHEUS_TIMEOUT_MS||2000)

const queries={
    cpuUsage:({service,namespace})=>`sum(rate(container_cpu_usage_seconds_total{namespace="${namespace}",pod=~"${service}.*"}[1m]))`,
    memoryUsage:({service,namespace})=>`sum(container_memory_working_set_bytes{namespace="${namespace}",pod=~"${service}.*"})`,
    requestLatency:()=>`histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))`,
    errorRate:()=>`sum(rate(api_errors_total[1m]))`,
    podRestartCount:({service,namespace})=>`sum(kube_pod_container_status_restarts_total{namespace="${namespace}",pod=~"${service}.*"})`
}

function metricValue(response){
    const result=response?.data?.result?.[0]
    const value=result?.value?.[1]
    return value===undefined?null:Number(value)
}

async function queryPrometheus(query){
    const url=new URL("/api/v1/query",prometheusUrl)
    url.searchParams.set("query",query)

    const response=await fetch(url,{signal:AbortSignal.timeout(prometheusTimeoutMs)})
    if(!response.ok){
        throw new Error(`prometheus query failed with ${response.status}`)
    }

    return response.json()
}

async function captureMetricsSnapshot(target){
    const snapshot={
        capturedAt:new Date().toISOString(),
        target
    }

    try{
        const entries=await Promise.all(
            Object.entries(queries).map(async([name,buildQuery])=>{
                const response=await queryPrometheus(buildQuery(target))
                return [name,metricValue(response)]
            })
        )

        for(const [name,value] of entries){
            snapshot[name]=value
        }
    }catch(err){
        snapshot.error=err.message
    }

    return snapshot
}

module.exports={captureMetricsSnapshot}
