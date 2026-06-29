import PusherServer from "pusher";
import PusherClient from "pusher-js";

let pusherServerInstance: PusherServer | null = null;

export function getPusherServer(): PusherServer {
  if (!pusherServerInstance) {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.VITE_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER || "ap2";

    if (!appId || !key || !secret) {
      console.warn("Pusher server environment variables are missing. Realtime events will not trigger.");
      // Return a mock or default instance to prevent outright crash, or throw clear error on use
      pusherServerInstance = new PusherServer({
        appId: appId || "mock-app-id",
        key: key || "mock-key",
        secret: secret || "mock-secret",
        cluster: cluster,
        useTLS: true,
      });
    } else {
      pusherServerInstance = new PusherServer({
        appId,
        key,
        secret,
        cluster,
        useTLS: true,
      });
    }
  }
  return pusherServerInstance;
}

// Client Pusher (instantiated in the browser safely)
export function getPusherClient(userId?: string) {
  const key = process.env.VITE_PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "mock-key";
  const cluster = process.env.VITE_PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  const getStoredId = () => {
    try {
      const saved = localStorage.getItem("fmi_auth_user");
      return saved ? JSON.parse(saved)?.id : "";
    } catch {
      return "";
    }
  };

  const id = userId || getStoredId();

  return new PusherClient(key, {
    cluster,
    forceTLS: true,
    authEndpoint: "/api/pusher/auth",
    auth: {
      headers: {
        Authorization: id ? `Bearer ${id}` : "",
      },
      params: {
        userId: id
      }
    }
  });
}
