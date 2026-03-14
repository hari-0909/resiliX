const express=require("express")
const cors=require("cors")

const chaosRoutes=require("./routes/chaosRoutes")

const app=express()

app.use(cors())
app.use(express.json())

app.use("/chaos",chaosRoutes)

app.get("/health",(req,res)=>{
res.json({status:"chaos controller running"})
})

const PORT=4000

app.listen(PORT,()=>{
console.log(`chaos controller running on ${PORT}`)
})