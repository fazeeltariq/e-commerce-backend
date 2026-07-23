import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        phone: {
            type: String,
            default: "",
        },

        avatar: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Mongoose middleware, pre-Hook
// Mongoose 9, async middleware is promise-based
// Mongoose waits for the async function to finish.
// When the Promise resolves, it automatically continues with the save.
// So there is no next middleware for you to manually call.


userSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});


// instance methods , 

userSchema.methods.matchPassword = async function (enteredPassword) {

    return await bcrypt.compare( enteredPassword,  this.password );

};

export const User = mongoose.model("User", userSchema);