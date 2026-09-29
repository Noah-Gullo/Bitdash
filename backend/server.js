const express = require("express");
require("dotenv").config();

const usersRouter = require("./routes/users");
const authenticateToken = require("./middleware/auth");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from CodeBox!");
});

app.use("/api/users", usersRouter);

app.get("/api/me", authenticateToken, (req, res) => {
  res.json({
    id: 1,
    name: "Alex",
    email: "alex@example.com",
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
