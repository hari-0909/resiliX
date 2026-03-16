const express=require("express")
const router=express.Router()

const {scheduleChaos}=require("../controllers/schedulerController")

router.post("/schedule",scheduleChaos)

module.exports=router