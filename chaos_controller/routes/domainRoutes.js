const express=require("express")
const router=express.Router()

const {
    getExperiments,
    getExperimentById,
    getExecutions,
    getExecutionById,
    getResults,
    getResultById,
    getReports,
    getReportById
}=require("../controllers/domainController")

router.get("/experiments",getExperiments)
router.get("/experiments/:id",getExperimentById)
router.get("/executions",getExecutions)
router.get("/executions/:id",getExecutionById)
router.get("/results",getResults)
router.get("/results/:id",getResultById)
router.get("/reports",getReports)
router.get("/reports/:id",getReportById)

module.exports=router
