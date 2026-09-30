import { useEffect, useState } from "react";

export default function LeaderboardPage({ apiUrl, onPlay }) {
  const [scores, setScores] = useState([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    fetch(`${apiUrl}/api/games/leaderboard`, { headers: { Authorization: `Bearer ${localStorage.getItem("bitdash-token")}` } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { setScores(data); setState("ready"); })
      .catch(() => setState("error"));
  }, [apiUrl]);

  return <section className="leaderboard-page">
    <div className="leaderboard-heading"><p className="eyebrow"><span className="pulse" /> HALL OF FAME</p><h1>Fast hands.<br /><em>Sharp</em> minds.</h1><p>Top scored 30-second Bitdash sprints.</p></div>
    <div className="leaderboard-table">
      <div className="leaderboard-row leaderboard-labels"><span>RANK</span><span>PLAYER</span><span>SCORE</span><span>PLAYED</span></div>
      {state === "loading" && <p className="leaderboard-state">Loading scores…</p>}
      {state === "error" && <p className="leaderboard-state">Couldn’t load the leaderboard.</p>}
      {state === "ready" && !scores.length && <p className="leaderboard-state">No scores yet. Set the first one.</p>}
      {scores.map((entry, index) => <div className="leaderboard-row" key={entry.id}><strong>{String(index + 1).padStart(2, "0")}</strong><span>{entry.name}</span><b>{entry.score}</b><time>{new Date(entry.createdAt).toLocaleDateString()}</time></div>)}
    </div>
    <button className="start leaderboard-play" onClick={onPlay}>Play a sprint <span>→</span></button>
  </section>;
}
