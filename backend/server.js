const express = require("express");
require("dotenv").config();
const cors = require("cors");
const passport = require("passport");

const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const authenticateToken = require("./middleware/auth");
require("./config/passport");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ name: "Bitdash API", status: "online" });
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

app.get("/api/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong." });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
