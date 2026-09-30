const crypto = require("crypto");
const supabase = require("../db");

function requireResult(error) {
  if (error) throw new Error(error.message);
}

async function createGameSession(userId) {
  const session = { id: crypto.randomUUID(), user_id: userId };
  const { data, error } = await supabase
    .from("game_sessions")
    .insert(session)
    .select("id, user_id, started_at")
    .single();
  requireResult(error);
  return data;
}

async function getGameSession(id, userId) {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("id, user_id, started_at, submitted_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  requireResult(error);
  return data;
}

async function submitScore(sessionId, userId, score) {
  const scoreId = crypto.randomUUID();
  const { data: scoreRow, error: scoreError } = await supabase
    .from("scores")
    .insert({ id: scoreId, user_id: userId, score, duration_seconds: 30 })
    .select("id, score, duration_seconds, created_at")
    .single();
  requireResult(scoreError);

  const { data: claimed, error: claimError } = await supabase
    .from("game_sessions")
    .update({ submitted_at: new Date().toISOString(), score_id: scoreId })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("submitted_at", null)
    .select("id");
  requireResult(claimError);

  if (!claimed?.length) {
    const { error: cleanupError } = await supabase.from("scores").delete().eq("id", scoreId);
    requireResult(cleanupError);
    return null;
  }

  return scoreRow;
}

module.exports = { createGameSession, getGameSession, submitScore };
