const jwt = require('jsonwebtoken');
require("dotenv").config();
const jwtKey=process.env.SECRET_KEY

function setToken(user){
  return jwt.sign({id:user._id,firstname:user.firstname,username:user.username},jwtKey,{ algorithm: 'HS256' })
}
function getUser(token){
  return jwt.verify(token,jwtKey,{ algorithm: 'HS256' })
}

module.exports={setToken,getUser}