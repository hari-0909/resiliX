const express=require("express")
const router=express.Router()

const {killApiPod,killRedis,cpuStress,networkDelay}=require("../controllers/chaosController")

router.post("/kill-api",killApiPod)
router.post("/kill-redis",killRedis)
router.post("/cpu-stress",cpuStress)
router.post("/network-delay",networkDelay)

module.exports=router