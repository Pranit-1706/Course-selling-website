const express= require("express")
const {Router} = require("express");
const {userModel, purchaseModel, courseModel} = require("../db.js")
const userRouter = Router();
const bcrypt = require("bcrypt");
const {z} = require("zod")
const jwt= require("jsonwebtoken");
const { userMiddleware } = require("../middlewares/user.js");
require("dotenv").config()

const jwt_secret_user= process.env.jwt_secret_user

userRouter.post("/signup",async function(req, res){
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
        await userModel.create({
            email,
            password:hashedPassword,
            firstName,
            lastName
        })
    }catch(e){
        return res.status(403).json({
            msg:"User already exists"
        })
    }
    res.json({
        msg:"You are signed up"
    })
})

userRouter.post("/signin",async function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    const user =await userModel.findOne({
        email
    })
    if(!user){
        return res.status(403).json({
            msg:"User not found"
        })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if(passwordMatch){
        const token = jwt.sign({
            id:user._id
        }, jwt_secret_user);
        
        res.json({
            token
        })
    }else{
        res.status(403).json({
            msg:"incorrect credentials"
        })
    }
})

userRouter.post("/purchases",userMiddleware,async function(req, res){
    const userId = req.userId;

    try{
        const purchases = await purchaseModel.find({
            userId
        })

        const courseData = await courseModel.find({
            _id: {$in : purchases.map(x=> x.courseId)}
        })
        res.json({
            purchases,
            courseData
        })
    }catch(e){
        res.status(403).json({
            msg:"Try Again"
        })
    }
})

module.exports = {
    userRouter
}