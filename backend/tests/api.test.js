process.env.JWT_SECRET = "test-jwt-secret";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../services/userService", () => ({
  createUser: jest.fn(),
  findByEmail: jest.fn(),
  getUsers: jest.fn(),
  getUserById: jest.fn(),
  publicUser: jest.fn((user) => ({ id: user.id, name: user.name, email: user.email })),
}));
jest.mock("../services/gameService", () => ({
  createGameSession: jest.fn(),
  getGameSession: jest.fn(),
  submitScore: jest.fn(),
  getLeaderboard: jest.fn(),
}));

const users = require("../services/userService");
const games = require("../services/gameService");
const app = require("../server");

const user = { id: "user-1", name: "Ada", email: "ada@example.com" };
const authHeader = () => ({ Authorization: `Bearer ${jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { algorithm: "HS256" })}` });
const gameTicket = () => jwt.sign({ sub: user.id, sid: "session-1", purpose: "game" }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: 45 });

describe("Bitdash API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    users.getUsers.mockResolvedValue([user]);
    users.getUserById.mockResolvedValue(user);
    users.createUser.mockResolvedValue(user);
    games.createGameSession.mockResolvedValue({ id: "session-1", user_id: user.id, started_at: new Date().toISOString() });
    games.getGameSession.mockResolvedValue({ id: "session-1", user_id: user.id, started_at: new Date(Date.now() - 31_000).toISOString(), submitted_at: null });
    games.submitScore.mockResolvedValue({ id: "score-1", score: 7 });
    games.getLeaderboard.mockResolvedValue({ entries: [{ id: "score-1", name: "Ada", score: 7 }], cache: "MISS" });
  });

  test("GET / reports API health", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ name: "Bitdash API", status: "online" });
  });

  test("POST /api/auth/register creates an account", async () => {
    users.findByEmail.mockResolvedValue(null);
    const response = await request(app).post("/api/auth/register").send({ name: "Ada", email: user.email, password: "password123" });
    expect(response.status).toBe(201);
    expect(response.body.user).toEqual(user);
    expect(response.body.token).toBeTruthy();
    expect(users.createUser).toHaveBeenCalled();
  });

  test("POST /api/auth/register rejects duplicate accounts", async () => {
    users.findByEmail.mockResolvedValue({ ...user, passwordHash: "hash" });
    const response = await request(app).post("/api/auth/register").send({ name: "Ada", email: user.email, password: "password123" });
    expect(response.status).toBe(409);
  });

  test("POST /api/auth/login issues a user JWT", async () => {
    users.findByEmail.mockResolvedValue({ ...user, passwordHash: await bcrypt.hash("password123", 4) });
    const response = await request(app).post("/api/auth/login").send({ email: user.email, password: "password123" });
    expect(response.status).toBe(200);
    expect(jwt.verify(response.body.token, process.env.JWT_SECRET).id).toBe(user.id);
  });

  test("POST /api/auth/login rejects invalid credentials", async () => {
    users.findByEmail.mockResolvedValue(null);
    const response = await request(app).post("/api/auth/login").send({ email: user.email, password: "password123" });
    expect(response.status).toBe(401);
  });

  test("GET /api/me requires a valid JWT", async () => {
    expect((await request(app).get("/api/me")).status).toBe(401);
    const response = await request(app).get("/api/me").set(authHeader());
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(user.id);
  });

  test("GET /api/users and /api/users/:id return user data", async () => {
    expect((await request(app).get("/api/users")).status).toBe(200);
    expect((await request(app).get(`/api/users/${user.id}`)).body).toEqual(user);
    users.getUserById.mockResolvedValueOnce(null);
    expect((await request(app).get("/api/users/missing")).status).toBe(404);
  });

  test("GET /api/games/leaderboard requires authentication and reports cache status", async () => {
    expect((await request(app).get("/api/games/leaderboard")).status).toBe(401);
    const response = await request(app).get("/api/games/leaderboard").set(authHeader());
    expect(response.status).toBe(200);
    expect(response.headers["x-bitdash-cache"]).toBe("MISS");
    expect(response.body).toEqual([{ id: "score-1", name: "Ada", score: 7 }]);
  });

  test("POST /api/games/start requires authentication and creates a session", async () => {
    expect((await request(app).post("/api/games/start")).status).toBe(401);
    const response = await request(app).post("/api/games/start").set(authHeader());
    expect(response.status).toBe(201);
    expect(response.body.gameToken).toBeTruthy();
    expect(games.createGameSession).toHaveBeenCalledWith(user.id);
  });

  test("POST /api/games/submit validates ownership and server timing", async () => {
    const response = await request(app).post("/api/games/submit").set(authHeader()).send({ gameToken: gameTicket(), score: 7 });
    expect(response.status).toBe(201);
    expect(games.submitScore).toHaveBeenCalledWith("session-1", user.id, 7);

    games.getGameSession.mockResolvedValueOnce({ id: "session-1", user_id: user.id, started_at: new Date().toISOString(), submitted_at: null });
    const early = await request(app).post("/api/games/submit").set(authHeader()).send({ gameToken: gameTicket(), score: 7 });
    expect(early.status).toBe(422);

    const otherTicket = jwt.sign({ sub: "other-user", sid: "session-1", purpose: "game" }, process.env.JWT_SECRET, { algorithm: "HS256" });
    const mismatch = await request(app).post("/api/games/submit").set(authHeader()).send({ gameToken: otherTicket, score: 7 });
    expect(mismatch.status).toBe(403);
  });
});
