export default function Navbar({ page, user, onNavigate, onAccount }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate("game")}>
        <span className="brand-mark">&gt;_</span>bitdash
      </button>
      <nav>
        <button className={page === "game" ? "active" : ""} onClick={() => onNavigate("game")}>play</button>
        <button className={page === "leaderboard" ? "active" : ""} onClick={() => onNavigate("leaderboard")}>leaderboard</button>
        <button className={page === "faq" ? "active" : ""} onClick={() => onNavigate("faq")}>faq</button>
      </nav>
      <button className="profile-button" onClick={onAccount} aria-label={user ? "Open account" : "Log in or sign up"}>
        <span>{user ? user.name.slice(0, 2).toUpperCase() : "→"}</span>
      </button>
    </header>
  );
}
