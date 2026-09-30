require("dotenv").config();

const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    "JWT_SECRET is required. Add it to your .env file before generating a token.",
  );
}

const token = jwt.sign({ sub: "1", name: "Alex" }, jwtSecret, {
  algorithm: "HS256",
  expiresIn: "15m",
});

console.log(token);
