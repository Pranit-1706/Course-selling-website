const jwt = require("jsonwebtoken")
const jwt_secret_user=process.env.jwt_secret_user

function userMiddleware(req, res, next){
    try {
        const token = req.headers.token;
        const decodedData = jwt.verify(token, jwt_secret_user);
        req.userId = decodedData.id;
        next();
    } catch (e) {
        res.status(403).json({ msg: "Sign in again" });
    }
}

module.exports = {
    userMiddleware
}