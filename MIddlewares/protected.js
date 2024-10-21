function isAuthenticated(req, res, next) {
    if (!req.app.locals.userId) {
      return res.status(401).json({ error: "Register First" });
    }
    next();
  }

module.exports=isAuthenticated;
