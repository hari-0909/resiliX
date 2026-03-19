const express=require("express")
const router=express.Router()

const {scheduleChaos,stopSchedule}=require("../controllers/schedulerController")

router.post("/schedule",scheduleChaos)
router.post("/stop-schedule",stopSchedule)

module.exports=router