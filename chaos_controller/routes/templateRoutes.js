const express=require("express")
const router=express.Router()

const {
    getTemplates,
    getTemplateById,
    postTemplate,
    putTemplate,
    removeTemplate,
    runTemplateById,
    postTemplateSchedule,
    getTemplateSchedule,
    deleteTemplateSchedule
}=require("../controllers/templateController")

router.get("/templates",getTemplates)
router.post("/templates",postTemplate)
router.post("/templates/:id/schedule",postTemplateSchedule)
router.get("/templates/:id/schedule",getTemplateSchedule)
router.delete("/templates/:id/schedule",deleteTemplateSchedule)
router.get("/templates/:id",getTemplateById)
router.put("/templates/:id",putTemplate)
router.delete("/templates/:id",removeTemplate)
router.post("/templates/:id/run",runTemplateById)

module.exports=router
