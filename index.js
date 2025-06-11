const express = require("express");
const mongoose = require("mongoose")
const {userRouter} = require("./routes/user")
const {courseRouter} = require("./routes/course")
const {adminRouter} = require("./routes/admin")
const app = express();
require("dotenv").config()

app.use(express.json());
app.use("/user", userRouter)
app.use("/admin", adminRouter)
app.use("course", courseRouter)

async function main() {
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(3000);
}
main();