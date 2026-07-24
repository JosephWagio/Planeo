import { CloudCheck, CloudSlash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabase";
import {
  createStarterWorkspace,
  useBoardStore,
  type WorkspaceSnapshot,
} from "../store";

type SyncState = "loading" | "synced" | "offline" | "error";

interface WorkspaceRow {
  boards: WorkspaceSnapshot["boards"];
  active_board_id: string;
  notifications: WorkspaceSnapshot["notifications"];
}

export function WorkspaceSync() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncState>("loading");

  useEffect(() => {
    const client = supabase;
    if (!client || !user) {
      setStatus("offline");
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;
    let saveTimer: number | undefined;

    const start = async () => {
      setStatus("loading");
      // Never expose the demo cache or a previous local session while an
      // authenticated user's private workspace is being resolved.
      useBoardStore.getState().hydrateWorkspace(createStarterWorkspace());
      const { data, error } = await client
        .from("workspaces")
        .select("boards, active_board_id, notifications")
        .eq("user_id", user.id)
        .maybeSingle<WorkspaceRow>();

      if (!active) return;
      if (error) {
        console.error("Could not load workspace", error);
        setStatus("error");
        return;
      }

      if (data) {
        useBoardStore.getState().hydrateWorkspace({
          boards: data.boards,
          activeBoardId: data.active_board_id,
          notifications: data.notifications ?? [],
        });
      } else {
        const starter = createStarterWorkspace();
        useBoardStore.getState().hydrateWorkspace(starter);
        const { error: insertError } = await client
          .from("workspaces")
          .insert({
            user_id: user.id,
            boards: starter.boards,
            active_board_id: starter.activeBoardId,
            notifications: starter.notifications,
          });
        if (insertError) {
          console.error("Could not create workspace", insertError);
          setStatus("error");
          return;
        }
      }

      if (!active) return;
      setStatus("synced");
      unsubscribe = useBoardStore.subscribe((state, previous) => {
        if (
          state.boards === previous.boards &&
          state.activeBoardId === previous.activeBoardId &&
          state.notifications === previous.notifications
        ) {
          return;
        }
        window.clearTimeout(saveTimer);
        setStatus("loading");
        saveTimer = window.setTimeout(async () => {
          const current = useBoardStore.getState();
          const { error: saveError } = await client
            .from("workspaces")
            .upsert({
              user_id: user.id,
              boards: current.boards,
              active_board_id: current.activeBoardId,
              notifications: current.notifications,
              updated_at: new Date().toISOString(),
            });
          if (!active) return;
          if (saveError) {
            console.error("Could not save workspace", saveError);
            setStatus("error");
          } else {
            setStatus("synced");
          }
        }, 700);
      });
    };

    void start();
    return () => {
      active = false;
      window.clearTimeout(saveTimer);
      unsubscribe?.();
    };
  }, [user]);

  return (
    <div className={`sync-status is-${status}`} role="status">
      {status === "synced" ? (
        <CloudCheck size={15} weight="fill" />
      ) : (
        <CloudSlash size={15} weight="fill" />
      )}
      <span>
        {status === "loading"
          ? "Saving…"
          : status === "synced"
            ? "Synced"
            : status === "error"
              ? "Sync issue"
              : "Local only"}
      </span>
    </div>
  );
}
