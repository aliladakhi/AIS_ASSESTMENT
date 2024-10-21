const express=require("express");
const path = require("path");
const connectDB = require("./Utilities/dbConnection");
const cookieParser = require("cookie-parser");
const cors = require('cors')


require('dotenv').config()
const checkAuth=require("./MIddlewares/auth")
const userRouter=require("./Routes/user")


const app=express();
const PORT=process.env.PORT || 9001;
const DBstring = process.env.MONGO_URL;



app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkAuth);


app.use("/",userRouter)

connectDB(DBstring)
.then(() => {
  console.log("DB connected");
})
.catch((error) => {
  console.error("DB connection failed:", error.message);
});



app.listen(PORT,(err)=>{
    console.log("Server Connected");
})