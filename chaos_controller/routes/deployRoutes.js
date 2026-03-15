const express=require("express")
const router=express.Router()

const {deployMicroservice}=require("../controllers/deployController")

router.post("/deploy-service",deployMicroservice)

module.exports=router