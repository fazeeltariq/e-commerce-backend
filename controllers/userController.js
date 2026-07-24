import { User } from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

// Add a Set-Cookie header to the HTTP response
// Set-Cookie: token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800

const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,      // production HTTPS
        sameSite: "none",  // allow cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
};


export const registerUser = asyncHandler( async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({ name, email, password  });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json (
        {  message: "User Registered Successfully", 
        
        user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role  }
    }
);

});


export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id);

    setTokenCookie(res, token);

    const userResponse = { _id: user._id, name: user.name, email: user.email,  role: user.role, };

    res.status(200).json({ message: "Login Successful", user: userResponse, });

});


export const logoutUser = asyncHandler(async (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    });

    res.status(200).json({ message: "Logged out successfully",  });
});



export const getUserProfile = asyncHandler(async (req, res) => {

    res.status(200).json({  user: req.user });

});



export const updateProfile = asyncHandler(async (req, res) => {

    const { name, email } = req.body;

    const user = req.user; // req.user is already a Mongoose document

  
    if (name?.trim()) {
        user.name = name.trim();
    }

    if (email?.trim()) {

        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedEmail !== user.email) {

            const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id }  });

            if (existingUser) {
                res.status(400);
                throw new Error("Email already exists.");
            }

            user.email = normalizedEmail;
        }
    }

    const updatedUser = await user.save();

    res.status(200).json({
        message: "Profile updated successfully.",
        user: { _id: updatedUser._id,  name: updatedUser.name,  email: updatedUser.email,  role: updatedUser.role,
        },
    });

});



export const changePassword = asyncHandler(async (req, res) => {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error("Current password and new password are required.");
    }

    const user = await User.findById(req.user.id).select("+password"); // already checked in protect

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect.");
    }

    if (currentPassword === newPassword) {
        res.status(400);
        throw new Error("New password must be different from the current password.");
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        message: "Password changed successfully."
    });

});




// HTTP/1.1 200 OK

// Set-Cookie: token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict

// Content-Type: application/json

// {
//     "message": "register successful"
// }



// httpOnly: true
// The browser stores the cookie, but JavaScript cannot read it. , This helps protect against XSS attacks.


// secure: true
// If true, the browser sends the cookie only over HTTPS.

//sameSite: strict
// Helps protect against CSRF attacks by restricting when the browser includes the cookie on cross-site requests.



// so , "We instructed Express to add a Set-Cookie header to the HTTP response."