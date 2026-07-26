const express=require("express")
const router=express.Router()

const {
    dashboardOverview,
    dashboardRecent,
    dashboardCluster,
    dashboardReports
}=require("../controllers/dashboardController")

router.get("/dashboard/overview",dashboardOverview)
router.get("/dashboard/recent",dashboardRecent)
router.get("/dashboard/cluster",dashboardCluster)
router.get("/dashboard/reports",dashboardReports)

module.exports=router
