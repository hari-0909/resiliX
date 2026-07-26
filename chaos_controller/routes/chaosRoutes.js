const express=require("express")
const router=express.Router()

const {killApiPod,killRedis,cpuStress,memoryStress,networkDelay}=require("../controllers/chaosController")

router.post("/kill-api",killApiPod)
router.post("/kill-redis",killRedis)
router.post("/cpu-stress",cpuStress)
router.post("/memory-stress",memoryStress)
router.post("/network-delay",networkDelay)

module.exports=router
