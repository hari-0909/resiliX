const express=require("express")
const cors=require("cors")
const deployRoutes=require("./routes/deployRoutes")
const chaosRoutes=require("./routes/chaosRoutes")
const serviceChaosRoutes=require("./routes/serviceChaosRoutes")
const schedulerRoutes=require("./routes/schedulerRoutes")

const app=express()

app.use(cors())
app.use(express.json())
app.use("/deploy",deployRoutes)
app.use("/chaos",chaosRoutes)
app.use("/chaos",serviceChaosRoutes)
app.use("/chaos",schedulerRoutes)

app.get("/health",(req,res)=>{
res.json({status:"chaos controller running"})
})

const PORT=4000

app.listen(PORT,()=>{
console.log(`chaos controller running on ${PORT}`)
})