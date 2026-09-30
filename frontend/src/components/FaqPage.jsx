const questions = [
  ["What is Bitdash?", "A 30-second speed drill for reading and calculating binary, hexadecimal, and decimal values."],
  ["How do I enter answers?", "Use 0x before hexadecimal values and 0b before binary values. Decimal answers need no prefix."],
  ["Which operations appear?", "Questions include addition, subtraction, AND, OR, XOR, NOT, and mixed-base conversions."],
  ["When is my score saved?", "Signed-in runs receive a short-lived game ticket at the start. The server accepts one score only after the 30-second timer ends."],
  ["Can I play without an account?", "You can browse the game and FAQ, but signing in is required to start a scored sprint and appear on the leaderboard."],
  ["Why was my score rejected?", "Tickets expire shortly after the sprint ends, cannot be reused, and must belong to the currently signed-in player."],
];

export default function FaqPage() {
  return <section className="faq-page"><div className="faq-heading"><p className="eyebrow"><span className="pulse" /> GOOD TO KNOW</p><h1>Questions,<br /><em>answered.</em></h1><p>Everything you need before your next sprint.</p></div><div className="faq-list">{questions.map(([question, answer]) => <article className="faq-item" key={question}><h2>{question}</h2><p>{answer}</p></article>)}</div></section>;
}
