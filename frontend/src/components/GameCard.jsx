import { useEffect, useRef, useState } from "react";

export default function GameCard({ current, time, score, streak, status, message, onStart, onAnswer }) {
  const [answer, setAnswer] = useState("");
  const input = useRef(null);
  const format = current.output === "hex" ? "Answer in hexadecimal" : current.output === "binary" ? "Answer in binary" : "Answer in decimal";

  useEffect(() => {
    if (status === "playing") {
      setAnswer("");
      setTimeout(() => input.current?.focus(), 0);
    }
  }, [current, status]);

  const submit = (event) => {
    event.preventDefault();
    if (status !== "playing") return;
    onAnswer(answer);
    setAnswer("");
  };

  return (
    <>
      <div className="stats">
        <div><span>TIME LEFT</span><strong className={time <= 8 && status === "playing" ? "danger" : ""}>{String(time).padStart(2, "0")}<small>s</small></strong></div>
        <div><span>SCORE</span><strong>{String(score).padStart(2, "0")}</strong></div>
        <div><span>STREAK</span><strong>{streak}<small>×</small></strong></div>
      </div>
      <div className="timer"><div style={{ width: `${((30 - time) / 30) * 100}%` }} /></div>
      <div className={`challenge-card ${status}`}>
        {status !== "playing" && <div className="card-overlay">
          <div className={status === "finished" ? "score-ring" : "overlay-icon"}>{status === "finished" ? score : "⌁"}</div>
          <h2>{status === "finished" ? "Time’s up." : "Ready to calculate?"}</h2>
          <p>{status === "finished" ? message || "Submitting your score…" : "Get as many answers as you can in 30 seconds."}</p>
          <button className="start" onClick={onStart}>{status === "finished" ? "Run it back" : "Start sprint"} <span>→</span></button>
        </div>}
        <div className="card-top"><span>CHALLENGE {score + 1}</span><span className="format-pill">{format}</span></div>
        <div className="equation">
          {current.op === "~" && <i>{current.op}</i>}<code>{current.left}</code>
          {current.op !== "~" && <><i>{current.op}</i><code>{current.right}</code></>}<b>=</b><span>?</span>
        </div>
        <form onSubmit={submit} className="answer-form">
          <input ref={input} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={current.output === "hex" ? "0x..." : current.output === "binary" ? "0b..." : "Type answer..."} disabled={status !== "playing"} autoComplete="off" spellCheck="false" />
          <button type="submit" disabled={status !== "playing"}>Enter <kbd>↵</kbd></button>
        </form>
      </div>
    </>
  );
}
