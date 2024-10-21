const mongoose=require("mongoose")
const {createHmac,randomBytes}=require("crypto")

const user=new mongoose.Schema({
  firstname:{
    type:String,
    required:true
  },
  secondname:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true,
    unique:true
  },
  salt:{
    type:String
  },
  password:{
    type:String,
    required:true
  }
},{
  timestamps:true
})
user.pre("save",function (next){
  const user=this;
  if(!user.isModified("password")) return;
  const salt=randomBytes(16).toString();
  const hashPassword=createHmac('sha256',salt).update(user.password).digest("hex")
  this.salt=salt
  this.password=hashPassword
  next()
})

const User=mongoose.model("user",user)

module.exports=User