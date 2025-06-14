import jwt from 'jsonwebtoken'     //used for authentication
import { Temp } from '../models/Temp.js';

export const isAuth = async(req,res,next)=>{
    try {
        const token = req.headers.token;

        if(!token)
            return res.status(403).json({
            message:"please Login"
        });

        const decodeData = jwt.verify(token, process.env.Jwt_Sec);

        req.user = await Temp.findById(decodeData._id)

        next()
    } catch (error) {
        res.status(500).json({
            message:"Login first"
        });
    }
};

export const isAdmin = (req, res, next) =>{
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({
                message: "you are not admin",
            });

        next();
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};