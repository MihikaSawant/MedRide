
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }

    let token = authHeader;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "").trim();
    }

    if (!token) {
      return res.status(401).json({
        message: "Token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user || decoded;

    next();
  } catch (err) {
    console.log("Auth middleware error:", err.message);
    return res.status(401).json({
      message: "Token is not valid",
    });
  }
};