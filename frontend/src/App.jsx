import { useEffect, useRef, useState } from "react";
import "./App.css";

const TIME_LIMIT = 30;
const asValue = (value, base) =>
  base === "hex"
    ? `0x${value.toString(16).toUpperCase()}`
    : base === "binary"
      ? `0b${value.toString(2)}`
      : String(value);
function question() {
  const bases = ["hex", "binary", "decimal"],
    ops = ["+", "−", "&", "|", "⊕", "~"],
    op = ops[Math.floor(Math.random() * ops.length)],
    a = Math.floor(Math.random() * 65535) + 1,
    b = Math.floor(Math.random() * 16383) + 1,
    result =
      op === "+"
        ? a + b
        : op === "−"
          ? Math.max(0, a - b)
          : op === "&"
            ? a & b
            : op === "|"
              ? a | b
              : op === "⊕"
                ? a ^ b
                : ~a & 0xffff,
    output = bases[Math.floor(Math.random() * bases.length)];
  return {
    left: asValue(a, bases[Math.floor(Math.random() * bases.length)]),
    right: asValue(b, bases[Math.floor(Math.random() * bases.length)]),
    op,
    result: asValue(result, output),
    output,
  };
}
function parseAnswer(value) {
  const answer = value.trim().toLowerCase();
  if (/^0x[0-9a-f]+$/.test(answer)) return parseInt(answer.slice(2), 16);
  if (/^0b[01]+$/.test(answer)) return parseInt(answer.slice(2), 2);
  if (/^\d+$/.test(answer)) return Number(answer);
  return NaN;
}
export default function App() {
  const [current, setCurrent] = useState(question),
    [answer, setAnswer] = useState(""),
    [time, setTime] = useState(TIME_LIMIT),
    [score, setScore] = useState(0),
    [streak, setStreak] = useState(0),
    [status, setStatus] = useState("idle"),
    input = useRef(null);
  const start = () => {
    setCurrent(question());
    setAnswer("");
    setTime(TIME_LIMIT);
    setScore(0);
    setStreak(0);
    setStatus("playing");
    setTimeout(() => input.current?.focus(), 0);
  };
  useEffect(() => {
    if (status !== "playing") return;
    if (time === 0) {
      setStatus("finished");
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [status, time]);
  const submit = (e) => {
    e.preventDefault();
    if (status !== "playing") return;
    const good = parseAnswer(answer) === parseAnswer(current.result);
    setScore((s) => s + (good ? 1 : 0));
    setStreak((s) => (good ? s + 1 : 0));
    setCurrent(question());
    setAnswer("");
  };
  const format =
    current.output === "hex"
      ? "Answer in hexadecimal"
      : current.output === "binary"
        ? "Answer in binary"
        : "Answer in decimal";
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">&gt;_</span>bitdash
        </a>
        <nav>
          <a href="#how">how it works</a>
          <a href="#leaderboard">leaderboard</a>
        </nav>
        <button className="profile-button" aria-label="Open profile">
          <span>NG</span>
        </button>
      </header>
      <section className="game" id="top">
        <div className="eyebrow">
          <span className="pulse" /> DAILY DRILL{" "}
          <span className="eyebrow-dot">•</span> BITS &amp; BASES
        </div>
        <h1>
          Think in <em>bits.</em>
          <br />
          Move at speed.
        </h1>
        <p className="intro">
          A 30-second sprint through binary, hex, decimal,
          <br className="desktop" /> and bitwise operations.
        </p>
        <div className="stats">
          <div>
            <span>TIME LEFT</span>
            <strong
              className={time <= 8 && status === "playing" ? "danger" : ""}
            >
              {String(time).padStart(2, "0")}
              <small>s</small>
            </strong>
          </div>
          <div>
            <span>SCORE</span>
            <strong>{String(score).padStart(2, "0")}</strong>
          </div>
          <div>
            <span>STREAK</span>
            <strong>
              {streak}
              <small>×</small>
            </strong>
          </div>
        </div>
        <div className="timer">
          <div
            style={{ width: `${((TIME_LIMIT - time) / TIME_LIMIT) * 100}%` }}
          />
        </div>
        <div className={`challenge-card ${status}`}>
          {status !== "playing" && (
            <div className="card-overlay">
              <div
                className={
                  status === "finished" ? "score-ring" : "overlay-icon"
                }
              >
                {status === "finished" ? score : "⌁"}
              </div>
              <h2>
                {status === "finished" ? "Time’s up." : "Ready to calculate?"}
              </h2>
              <p>
                {status === "finished"
                  ? "Your quickest run is waiting to be beaten."
                  : "Get as many answers as you can in 30 seconds."}
              </p>
              <button className="start" onClick={start}>
                {status === "finished" ? "Run it back" : "Start sprint"}{" "}
                <span>→</span>
              </button>
            </div>
          )}
          <div className="card-top">
            <span>CHALLENGE {score + 1}</span>
            <span className="format-pill">{format}</span>
          </div>
          <div className="equation">
          {current.op === "~" && <i>{current.op}</i>}
          <code>{current.left}</code>
          {current.op !== "~" && <><i>{current.op}</i><code>{current.right}</code></>}
            <b>=</b>
            <span>?</span>
          </div>
          <form onSubmit={submit} className="answer-form">
            <input
              ref={input}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={
                current.output === "hex"
                  ? "0x..."
                  : current.output === "binary"
                    ? "0b..."
                    : "Type answer..."
              }
              disabled={status !== "playing"}
              autoComplete="off"
              spellCheck="false"
            />
            <button type="submit" disabled={status !== "playing"}>
              Enter <kbd>↵</kbd>
            </button>
          </form>
        </div>
        <p className="tip">
          <span>✦</span> Tip: Prefix hex with <code>0x</code> and binary with{" "}
          <code>0b</code>
        </p>
      </section>
      <section className="how" id="how">
        <span>THE RULES</span>
        <div>
          <h2>
            Simple inputs.
            <br />
            <em>Serious</em> brain gains.
          </h2>
          <p>
            Solve mixed-base conversions and operations before the clock runs
            out. Correct answers build your score; streaks prove your flow.
          </p>
        </div>
      </section>
      <footer id="leaderboard">
        <span>© 2026 BITDASH</span>
        <span>MADE FOR PEOPLE WHO READ HEX FOR FUN</span>
        <span>⌘</span>
      </footer>
    </main>
  );
}
