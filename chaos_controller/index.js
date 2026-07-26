const express=require("express")
const cors=require("cors")
const deployRoutes=require("./routes/deployRoutes")
const chaosRoutes=require("./routes/chaosRoutes")
const serviceChaosRoutes=require("./routes/serviceChaosRoutes")
const schedulerRoutes=require("./routes/schedulerRoutes")
const serviceRoutes=require("./routes/serviceRoutes")
const domainRoutes=require("./routes/domainRoutes")
const templateRoutes=require("./routes/templateRoutes")
const clusterRoutes=require("./routes/clusterRoutes")
const dashboardRoutes=require("./routes/dashboardRoutes")
const {startResultConsumer}=require("./services/resultService")

const app=express()

app.use(cors())
app.use(express.json())
app.use("/deploy",deployRoutes)
app.use("/chaos",chaosRoutes)
app.use("/chaos",serviceChaosRoutes)
app.use("/chaos",schedulerRoutes)
app.use("/",domainRoutes)
app.use("/",templateRoutes)
app.use("/",clusterRoutes)
app.use("/",dashboardRoutes)
app.use("/",serviceRoutes)

app.get("/health",(req,res)=>{
    res.json({status:"chaos controller running"})
})

const PORT=4000

app.listen(PORT,()=>{
    console.log(`chaos controller running on ${PORT}`)
})

startResultConsumer().catch(err=>{
    console.error("result consumer failed",err)
})