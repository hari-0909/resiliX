const express=require("express")
const router=express.Router()

const {killApiPod,killRedis,cpuStress}=require("../controllers/chaosController")

router.post("/kill-api",killApiPod)
router.post("/kill-redis",killRedis)
router.post("/cpu-stress",cpuStress)

module.exports=router