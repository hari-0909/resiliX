const express=require("express")
const router=express.Router()

const {killServicePod}=require("../controllers/serviceChaosController")

router.post("/kill-service",killServicePod)

module.exports=router