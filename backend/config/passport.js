const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcryptjs");
const { findByEmail } = require("../services/userService");

passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
  try {
    const user = await findByEmail(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return done(null, false, { message: "Email or password is incorrect." });
    return done(null, user);
  } catch (error) { return done(error); }
}));
