const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const {
  createGameSession,
  getGameSession,
  submitScore,
  getLeaderboard,
} = require("../services/gameService");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
const GAME_SECONDS = 30;
const SUBMISSION_GRACE_SECONDS = 10;

function gameTokenFor(session) {
  return jwt.sign(
    { sub: session.user_id, sid: session.id, purpose: "game" },
    jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: GAME_SECONDS + SUBMISSION_GRACE_SECONDS + 5,
    },
  );
}

router.get("/leaderboard", authenticateToken, async (req, res, next) => {
  try {
    const result = await getLeaderboard();
    res.set("X-Bitdash-Cache", result.cache).json(result.entries);
  } catch (error) {
    next(error);
  }
});

router.post("/start", authenticateToken, async (req, res, next) => {
  try {
    const session = await createGameSession(req.user.id);
    res.status(201).json({
      gameToken: gameTokenFor(session),
      durationSeconds: GAME_SECONDS,
      startedAt: session.started_at,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/submit",
  authenticateToken,
  [
    body("gameToken").isString().notEmpty(),
    body("score").isInt({ min: 0, max: 9999 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(422)
        .json({ error: "A valid score and game ticket are required." });

    try {
      let ticket;
      try {
        ticket = jwt.verify(req.body.gameToken, jwtSecret, {
          algorithms: ["HS256"],
        });
      } catch {
        return res
          .status(401)
          .json({ error: "This game ticket is invalid or has expired." });
      }
      if (
        ticket.purpose !== "game" ||
        ticket.sub !== req.user.id ||
        !ticket.sid
      ) {
        return res
          .status(403)
          .json({
            error: "This game ticket does not belong to the signed-in user.",
          });
      }

      const session = await getGameSession(ticket.sid, req.user.id);
      if (!session || session.submitted_at)
        return res
          .status(409)
          .json({ error: "This game has already been submitted." });

      const elapsedSeconds =
        (Date.now() - new Date(session.started_at).getTime()) / 1000;
      if (elapsedSeconds < GAME_SECONDS) {
        return res
          .status(422)
          .json({
            error:
              "A score can only be submitted after the 30-second game has ended.",
          });
      }
      if (elapsedSeconds > GAME_SECONDS + SUBMISSION_GRACE_SECONDS) {
        return res
          .status(422)
          .json({ error: "The score-submission window has expired." });
      }

      const score = await submitScore(session.id, req.user.id, req.body.score);
      if (!score)
        return res
          .status(409)
          .json({ error: "This game has already been submitted." });
      res.status(201).json({ score });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
