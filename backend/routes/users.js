const express = require("express");
const { getUserById, getUsers } = require("../services/userService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await getUsers());
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
  const user = await getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
  } catch (error) { next(error); }
});

module.exports = router;
