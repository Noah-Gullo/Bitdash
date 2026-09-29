const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required. Add it to your .env file before starting the server.");
}

function authenticateToken(req, res, next) {
  const authorization = req.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  
  const token = authorization.slice("Bearer ".length);

  if (!token) {
    return res.status(401).json({ error: "No token found." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized access to server resource" });
  }
}

module.exports = authenticateToken;
