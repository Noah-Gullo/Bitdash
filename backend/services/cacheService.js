const { Redis } = require("@upstash/redis");

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const LEADERBOARD_KEY = "bitdash:leaderboard:v1";
const LEADERBOARD_TTL_SECONDS = 60;

function isCacheConfigured() {
  return Boolean(redis);
}

async function getLeaderboardCache() {
  if (!redis) return null;
  try {
    const value = await redis.get(LEADERBOARD_KEY);
    return Array.isArray(value) ? value : null;
  } catch (error) {
    console.error("Leaderboard cache read failed:", error.message);
    return null;
  }
}

async function cacheLeaderboard(entries) {
  if (!redis) return;
  try {
    await redis.set(LEADERBOARD_KEY, entries, { ex: LEADERBOARD_TTL_SECONDS });
  } catch (error) {
    console.error("Leaderboard cache write failed:", error.message);
  }
}

async function invalidateLeaderboardCache() {
  if (!redis) return;
  try {
    await redis.del(LEADERBOARD_KEY);
  } catch (error) {
    console.error("Leaderboard cache invalidation failed:", error.message);
  }
}

module.exports = {
  isCacheConfigured,
  getLeaderboardCache,
  cacheLeaderboard,
  invalidateLeaderboardCache,
};
