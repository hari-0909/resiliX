const express=require("express")
const {createClient}=require("redis")
const {Pool}=require("pg")
const client=require("prom-client")

const app=express()
app.use(express.json())

const collectDefaultMetrics=client.collectDefaultMetrics
collectDefaultMetrics()

const http_requests_total=new client.Counter({
name:"http_requests_total",
help:"Total API requests"
})

const http_request_duration_seconds=new client.Histogram({
name:"http_request_duration_seconds",
help:"Request latency",
buckets:[0.05,0.1,0.2,0.5,1,2]
})

const api_errors_total=new client.Counter({
name:"api_errors_total",
help:"Total API errors"
})

const redis_client=createClient({url:"redis://redis:6379"})
redis_client.connect().catch(()=>{})

const pg_pool=new Pool({
host:"postgres",
user:"postgres",
password:"postgres",
database:"testdb",
port:5432
})

app.get("/health",(req,res)=>{
http_requests_total.inc()
res.json({status:"ok",service:"api"})
})

app.get("/metrics",async(req,res)=>{
res.set("Content-Type",client.register.contentType)
res.end(await client.register.metrics())
})

app.get("/load",async(req,res)=>{
const end=http_request_duration_seconds.startTimer()
http_requests_total.inc()
try{
await redis_client.set("last_hit",Date.now().toString())
await pg_pool.query("SELECT NOW()")
res.json({message:"load generated"})
}catch(e){
api_errors_total.inc()
res.status(500).json({error:"dependency failure"})
}
end()
})

app.get("/cpu",(req,res)=>{
const end=http_request_duration_seconds.startTimer()
http_requests_total.inc()
let x=0
for(let i=0;i<1e8;i++){x+=i}
res.json({message:"cpu stress done"})
end()
})

app.listen(3000,()=>console.log("api running on 3000"))