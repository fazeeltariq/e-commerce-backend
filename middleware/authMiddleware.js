import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js"

// we are not using async Handler here because we want to show errors in more detail

const protect = async (req, res, next) => {

    try {

        const token = req.cookies.token;

        // if we do token = "", during logout
        
        if (!token) {
            return res.status(401).json({ message: "Not Authorized" });
        }

        const decoded = jwt.verify( token, process.env.JWT_SECRET ); // returns ID
        
        req.user = await User.findById(decoded.id).select("-password");
        
        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    }

    catch (error) {

        return res.status(401).json({  message: "Invalid Token" });
    }

};

export default protect;