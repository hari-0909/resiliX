const express=require("express")
const router=express.Router()

const {killApiPod,killRedis}=require("../controllers/chaosController")

router.post("/kill-api",killApiPod)
router.post("/kill-redis",killRedis)

module.exports=router