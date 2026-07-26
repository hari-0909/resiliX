const {
    getOverview,
    getRecent,
    getCluster,
    getReportSummaries
}=require("../services/dashboardService")

async function dashboardOverview(req,res){
    try{
        res.json(await getOverview())
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch dashboard overview"})
    }
}

async function dashboardRecent(req,res){
    try{
        res.json(await getRecent())
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch recent dashboard data"})
    }
}

async function dashboardCluster(req,res){
    try{
        res.json(await getCluster())
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch dashboard cluster data"})
    }
}

async function dashboardReports(req,res){
    try{
        res.json(await getReportSummaries())
    }catch(err){
        console.error(err)
        res.status(500).json({error:"failed to fetch dashboard reports"})
    }
}

module.exports={
    dashboardOverview,
    dashboardRecent,
    dashboardCluster,
    dashboardReports
}
