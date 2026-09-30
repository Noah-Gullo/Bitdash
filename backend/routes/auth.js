const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const {
  createUser,
  findByEmail,
  publicUser,
} = require("../services/userService");
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret)
  throw new Error(
    "JWT_SECRET is required. Add it to your .env file before starting the server.",
  );
const tokenFor = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, jwtSecret, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
const validate = (req, res, next) => {
  const errors = validationResult(req);
  return errors.isEmpty()
    ? next()
    : res
        .status(422)
        .json({
          error: "Validation failed",
          details: errors
            .array()
            .map(({ path, msg }) => ({ field: path, message: msg })),
        });
};
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 40 })
      .withMessage("Name must be 2–40 characters."),
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Enter a valid email."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (await findByEmail(req.body.email))
        return res
          .status(409)
          .json({ error: "An account with that email already exists." });
      const user = await createUser(req.body);
      res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  },
);
router.post(
  "/login",
  [
    body("email").trim().isEmail().normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  (req, res, next) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error) return next(error);
      if (!user)
        return res
          .status(401)
          .json({ error: info?.message || "Login failed." });
      return res.json({ token: tokenFor(user), user: publicUser(user) });
    })(req, res, next);
  },
);
module.exports = router;
