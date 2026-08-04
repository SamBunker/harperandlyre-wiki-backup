import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { WikiPage } from "./WikiPage";
import { PageList } from "./PageList";

const HOME_SLUG = "home";

export function HomePage() {
  const { user } = useAuth();

  return (
    <WikiPage
      slugOverride={HOME_SLUG}
      notFoundFallback={
        user ? (
          <div className="homepage-setup">
            <p>
              No homepage set yet. Create a page titled <strong>Home</strong> to customize what
              visitors see here.
            </p>
            <Link to="/new">Create homepage</Link>
          </div>
        ) : (
          <PageList />
        )
      }
    />
  );
}
