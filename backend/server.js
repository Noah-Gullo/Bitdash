const express = require("express");
require("dotenv").config();
const cors = require("cors");
const passport = require("passport");

const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const gamesRouter = require("./routes/games");
const authenticateToken = require("./middleware/auth");
require("./config/passport");

const app = express();
const port = process.env.PORT || 3000;
const defaultOrigins = ["http://localhost:5173", "https://bitdash-ruby.vercel.app"];
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/[/]$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.get("/", (req, res) => {
  res.json({ name: "Bitdash API", status: "online" });
});

app.use(cors({
  origin(origin, callback) {
    // Browser extensions and server-to-server requests have no Origin header.
    if (!origin || allowedOrigins.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/games", gamesRouter);

app.get("/api/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong." });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

module.exports = app;
