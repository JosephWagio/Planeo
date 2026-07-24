import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "./auth/AuthContext";
import { LandingPage } from "./components/LandingPage";

const AuthPage = lazy(() =>
  import("./components/AuthPage").then((module) => ({
    default: module.AuthPage,
  }))
);

const WorkspaceApp = lazy(() =>
  import("./components/WorkspaceApp").then((module) => ({
    default: module.WorkspaceApp,
  }))
);

function LoadingScreen() {
  return (
    <div className="app-loading" role="status">
      <span className="app-loading-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <strong>Planeo</strong>
      <small>Opening your workspace…</small>
    </div>
  );
}

export function App() {
  const { user, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  useEffect(() => {
    const publicLanding = path === "/";
    const titles: Record<string, string> = {
      "/": "Planeo Kanban Board – Visual Project Planning",
      "/login": "Log in to Planeo",
      "/signup": "Create your Planeo workspace",
      "/reset-password": "Reset your Planeo password",
      "/app": "Planeo workspace",
    };
    document.title = titles[path] ?? titles["/"];

    const robots = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]'
    );
    if (robots) {
      robots.content = publicLanding
        ? "index, follow, max-image-preview:large, max-snippet:-1"
        : "noindex, nofollow";
    }

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = `${window.location.origin}${publicLanding ? "/" : path}`;
  }, [path]);

  const navigate = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (loading) return;
    if (user && path !== "/app" && path !== "/reset-password") {
      window.history.replaceState({}, "", "/app");
      setPath("/app");
    }
    if (!user && path === "/app") {
      window.history.replaceState({}, "", "/login");
      setPath("/login");
    }
  }, [loading, path, user]);

  if (loading) return <LoadingScreen />;
  if (user && path === "/reset-password") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AuthPage mode="reset" navigate={navigate} />
      </Suspense>
    );
  }
  if (user) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <WorkspaceApp />
      </Suspense>
    );
  }
  if (
    path === "/login" ||
    path === "/signup" ||
    path === "/reset-password"
  ) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AuthPage
          key={path}
          mode={
            path === "/signup"
              ? "signup"
              : path === "/reset-password"
                ? "reset"
                : "login"
          }
          navigate={navigate}
        />
      </Suspense>
    );
  }
  return <LandingPage navigate={navigate} />;
}
