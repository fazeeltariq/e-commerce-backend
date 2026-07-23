import mongoose from "mongoose";

const validateObjectId = (paramName = "id") => {

    return (req, res, next) => {

        const id = req.params[paramName];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400);
            throw new Error("Invalid ID");
        }

        next();
    };

};

export default validateObjectId;