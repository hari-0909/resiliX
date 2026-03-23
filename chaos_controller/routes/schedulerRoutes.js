const express=require("express")
const router=express.Router()

const {scheduleChaos,stopSchedule,getSchedules}=require("../controllers/schedulerController")

router.post("/schedule",scheduleChaos)
router.post("/stop-schedule",stopSchedule)
router.get("/schedules",getSchedules)

module.exports=router