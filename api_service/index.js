const express=require("express")
const {createClient}=require("redis")
const {Pool}=require("pg")

const app=express()
app.use(express.json())

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
res.json({status:"ok",service:"api"})
})

app.get("/load",async(req,res)=>{
try{
await redis_client.set("last_hit",Date.now().toString())
await pg_pool.query("SELECT NOW()")
res.json({message:"load generated"})
}catch(e){
res.status(500).json({error:"dependency failure"})
}
})

app.get("/cpu",(req,res)=>{
let x=0
for(let i=0;i<1e8;i++){x+=i}
res.json({message:"cpu stress done"})
})

app.listen(3000,()=>console.log("api running on 3000"))