const express=require("express")
const router=express.Router()

const {killApiPod}=require("../controllers/chaosController")

router.post("/kill-api",killApiPod)

module.exports=router