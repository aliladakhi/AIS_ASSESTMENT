const { Router } = require("express");
const User = require("../Models/user");
const { createHmac } = require("crypto");
const { setToken,getUser } = require("../Utilities/token")
const isAuthenticated=require("../MIddlewares/protected")
const userRouter = Router();
userRouter.route("")
    .get((req,res)=>{
       const name = req.user ? req.user.firstname : null;
       console.log(name);
       
        res.render("Home", {name,refresh:null});
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
    console.error(" error:", error.message);
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

    // Check for this username int he data base if it already exist?
    const existingUser = await User.findOne({ username });
    if (existingUser) {
    return res.render("Register", {
        name: "Register Here",
        error: "Username already taken. Please choose another one."
    });
    }
    const user = await User.create({ firstname, secondname, username, password });
    const token = setToken(user);
    req.app.locals.userId = user._id;
    res.cookie("sessionId", token).redirect("/");
} catch (error) {
    console.error("Register :", error.message);
    res.render("Register", {
    name: "Register Here",
    error: "An unexpected error occurred. Please try again."
    });
}
});

userRouter.route("/Refresh")
  .get((req, res) => {
    try {
      const sessionId = req.cookies.sessionId;
      if (!sessionId) {
        return res.status(401).send("sessionId missing");
      }
      const user = getUser(sessionId);

      if (!user) {
        return res.status(403).send("Invalid refresh token");
      }
      const name = req.user ? req.user.firstname : null;
      const newAccessToken = setToken(user);
      res.cookie("sessionId", newAccessToken);
      res.render("Home",{name,refresh:"You get a new session token"});
      //res.send("Token refreshed successfully");
    } catch (error) {
      console.error("Refresh error:", error.message);
      res.status(500).send("Server error");
    }
  });


userRouter.route('/logout')
.get((req, res) => {
res.clearCookie('sessionId');
res.redirect('/Login');
});

module.exports = userRouter;
