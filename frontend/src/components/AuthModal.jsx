export default function AuthModal({ user, mode, loading, error, onClose, onSubmit, onSwitch, onLogout }) {
  return <div className="auth-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="auth-close" onClick={onClose} aria-label="Close">×</button>
      {user ? <><p className="auth-eyebrow">SIGNED IN</p><h2 id="auth-title">Hey, {user.name}.</h2><p className="auth-copy">Your account is ready for the next sprint.</p><button className="auth-submit" onClick={onLogout}>Log out <span>→</span></button></> : <>
        <p className="auth-eyebrow">BITDASH ACCOUNT</p><h2 id="auth-title">{mode === "login" ? "Welcome back." : "Start your streak."}</h2><p className="auth-copy">{mode === "login" ? "Log in to play scored sprints." : "Create an account to begin playing."}</p>
        <form className="auth-form" onSubmit={onSubmit}>
          {mode === "signup" && <label>Name<input name="name" minLength="2" maxLength="40" required placeholder="Ada Lovelace" /></label>}
          <label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" minLength="8" required autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="At least 8 characters" /></label>
          {error && <p className="auth-error">{error}</p>}<button className="auth-submit" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"} <span>→</span></button>
        </form>
        <button className="auth-switch" onClick={onSwitch}>{mode === "login" ? "New to Bitdash? Create an account" : "Already have an account? Log in"}</button>
      </>}
    </section>
  </div>;
}
