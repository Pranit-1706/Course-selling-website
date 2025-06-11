const {Router} = require("express")
const {userMiddleware} = require("../middlewares/user")
const {purchaseModel, courseModel} = require("../db.js")
const courseRouter = Router()

courseRouter.post("/purchase",userMiddleware,async function(req, res){
    const userId = req.userId
    const courseId = req.body.courseId;
    
    try{
        await purchaseModel.create({
            userId,
            courseId
        })

        res.json({
            msg:"You have successfully bought the course"
        })
    }catch(e){
        res.status(403).json({
            msg:"Try Again after some time"
        })
    }
})

courseRouter.get("/preview",async function(req, res){
    try{
        const courses = await courseModel.find({});
        res.json({
            courses
        })
    }catch(e){
        res.status(403).json({
            msg:"Try Again"
        })
    }
})

module.exports={
    courseRouter
}