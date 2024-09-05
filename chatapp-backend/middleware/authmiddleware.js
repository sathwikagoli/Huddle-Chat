const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Enhanced middleware to check if the user is online
module.exports.isOnline = function (req, res, next) {
  if (!req.user.online) {
    return res.status(403).json({ msg: "User is not online" });
  }
  next();
};
