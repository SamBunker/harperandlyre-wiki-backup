import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { LoginForm } from "./LoginForm";
import { SearchBox } from "./SearchBox";

export function Nav() {
  const { user, loading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        Harper &amp; Lyre Wiki
      </Link>
      <SearchBox />
      <div className="nav-links">
        {loading ? null : user ? (
          <>
            <Link to="/new">New Page</Link>
            <span className="nav-user">{user.name}</span>
            <button onClick={logout}>Log out</button>
          </>
        ) : showLogin ? (
          <LoginForm onClose={() => setShowLogin(false)} />
        ) : (
          <button onClick={() => setShowLogin(true)}>Log in to edit</button>
        )}
      </div>
    </nav>
  );
}
