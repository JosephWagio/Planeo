import { SignOut } from "@phosphor-icons/react";
import { useAuth } from "../auth/AuthContext";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const name =
    (user?.user_metadata.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Account";
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="workspace-user">
      <span className="workspace-user-avatar">{initials}</span>
      <span className="workspace-user-copy">
        <strong>{name}</strong>
        <small>{user?.email}</small>
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        aria-label="Log out"
        title="Log out"
      >
        <SignOut size={17} weight="bold" />
      </button>
    </div>
  );
}
