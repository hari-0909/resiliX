const express=require("express")
const router=express.Router()

const {
    listClusterNamespaces,
    listNamespaceDeployments,
    listNamespaceServices,
    listNamespacePods
}=require("../controllers/clusterController")

router.get("/cluster/namespaces",listClusterNamespaces)
router.get("/cluster/namespaces/:namespace/deployments",listNamespaceDeployments)
router.get("/cluster/namespaces/:namespace/services",listNamespaceServices)
router.get("/cluster/namespaces/:namespace/pods",listNamespacePods)

module.exports=router
