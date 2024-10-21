const {getUser}=require("../Utilities/token")
function checkAuth(req,res,next){
  if(!req.cookies || !req.cookies.sessionId){
    req.user=null
  }
  else{
    const user=getUser(req.cookies.sessionId)
    req.user=user
  }

  next()
}

module.exports=checkAuth;