const { Router } = require("express");
const User = require("../Models/user");
const { createHmac } = require("crypto");
const { setToken } = require("../Utilities/token")
const isAuthenticated=require("../MIddlewares/protected")
const userRouter = Router();
const path=require("path")

userRouter.route("")
    .get((req,res)=>{
       const name = req.user ? req.user.firstname : null;
       console.log(name);
       
        res.render("Home", {name});
    })




userRouter.route("/protected")
.get(isAuthenticated, (req, res) => {
    const userId = req.app.locals.userId;
    res.json({ userId });
});


userRouter.route("/Login")
.get((req, res) => {
    const name = req.user ? req.user.firstname : null;
    res.render("Login", { name, error: null });
})
.post(async (req, res) => {
    try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.render("Login", {
        name: "USER",
        error: "User not found. Please check your username."
        });
    }
    const salt = user.salt;
    const hashPassword = createHmac('sha256', salt).update(password).digest("hex");
    if (hashPassword !== user.password) {
        return res.render("Login", {
        name: "USER",
        error: "Credentials are incorrect. Please try again."
        });
    }
    const token = setToken(user);
    req.app.locals.userId = user._id;
    res.cookie("sessionId", token).redirect("/");
    } catch (error) {
    console.error("Signin error:", error.message);
    res.render("Login", {
        name: "USER",
        error: "An unexpected error occurred. Please try again."
    });
    }
});
  




userRouter.route("/Register")
.get((req, res) => {
const name = req.user ? req.user.firstname : null;
res.render("Register", { name, error: null });
})
.post(async (req, res) => {
try {
    const { firstname, secondname, username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
    return res.render("Register", {
        name: "Register Here",
        error: "Username already taken. Please choose another one."
    });
    }

    // Create new user
    const user = await User.create({ firstname, secondname, username, password });
    const token = setToken(user);
    req.app.locals.userId = user._id;
    res.cookie("sessionId", token).redirect("/");
} catch (error) {
    console.error("Register error:", error.message);
    res.render("Register", {
    name: "Register Here",
    error: "An unexpected error occurred. Please try again."
    });
}
});




userRouter.route('/logout')
.get((req, res) => {
res.clearCookie('sessionId');
res.redirect('/Login');
});

module.exports = userRouter;
