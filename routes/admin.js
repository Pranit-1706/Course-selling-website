const {Router} = require("express")
const adminRouter = Router();
const {adminModel, courseModel}= require("../db.js")
const {z} = require("zod")
const jwt = require("jsonwebtoken")
const bcrypt= require("bcrypt")
require("dotenv").config()

const jwt_secret_admin=process.env.jwt_secret_admin
const {adminMiddleware} = require("../middlewares/admin.js")

adminRouter.post("/signup",async function(req, res){
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        firstName:z.string().min(3).max(100),
        lastName:z.string().min(3).max(100),
        password: z.string().min(3).max(100)
    })
    const parsedData = requiredBody.safeParse(req.body);
    if(!parsedData.success){
        return res.status(403).json({
            msg:"Incorrect Format",
        })
    }

    const {email, password, firstName, lastName} = req.body;
    try{
        const hashedPassword =await bcrypt.hash(password, 5)
        await adminModel.create({
            email,
            password:hashedPassword,
            firstName,
            lastName
        })
    }catch(e){
        return res.status(403).json({
            msg:"Admin already exists"
        })
    }
    res.json({
        msg:"You are signed up"
    })
})

adminRouter.post("/signin",async function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    const admin =await adminModel.findOne({
        email
    })
    if(!admin){
        return res.status(403).json({
            msg:"Admin not found"
        })
    }

    const passwordMatch = await bcrypt.compare(password, admin.password)
    if(passwordMatch){
        const token = jwt.sign({
            id:admin._id
        }, jwt_secret_admin);
        
        res.json({
            token
        })
    }else{
        res.status(403).json({
            msg:"incorrect credentials"
        })
    }
})

adminRouter.post("/course",adminMiddleware,async function(req, res){
    const adminId = req.userId
    const {title, description, imageUrl, price} = req.body;

    try{
        const course =await courseModel.create({
            title,
            description,
            imageUrl,
            price,
            createrId:adminId
        })

        res.json({
            msg:"Course Created",
            courseId: course._id
        })
    }catch(e){
        res.status(403).json({
            msg:"Try Again"
        })
    }
})

adminRouter.put("/course",adminMiddleware ,async function(req, res){
    const adminId = req.userId
    const {title, description, imageUrl, price, courseId} = req.body;

    try{
        const course =await courseModel.updateOne({
            _id:courseId,
            createrId: adminId
        },
        {
            title,
            description,
            imageUrl,
            price,
            createrId:adminId
        })

        res.json({
            msg:"Course Updated",
            courseId: courseId
        })
    }catch(e){
        res.status(403).json({
            msg:"Try Again"
        })
    }
})

adminRouter.get("/course/bulk",adminMiddleware, async function(req, res){
    const adminId = req.userId
    try{
        const courses =await courseModel.find({
            createrId: adminId
        })

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
    adminRouter
}