import { useEffect, useRef } from "react";
import { getPusherClient } from "../../lib/pusher.ts";

interface PusherBinding {
  eventName: string;
  callback: (data: any) => void;
}

export function usePusher(channelName: string, bindings: PusherBinding[]) {
  const bindingsRef = useRef<PusherBinding[]>(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    if (!channelName) return;

    let pusherClient: any = null;
    let channel: any = null;

    try {
      pusherClient = getPusherClient();
      channel = pusherClient.subscribe(channelName);

      // Bind all specified events
      bindingsRef.current.forEach(({ eventName, callback }) => {
        channel.bind(eventName, (data: any) => {
          callback(data);
        });
      });
    } catch (error) {
      console.error(`[Pusher Error] Subscription failed for channel ${channelName}:`, error);
    }

    return () => {
      if (pusherClient && channel) {
        try {
          bindingsRef.current.forEach(({ eventName }) => {
            channel.unbind(eventName);
          });
          pusherClient.unsubscribe(channelName);
        } catch (err) {
          console.warn("[Pusher Error] Failed to unsubscribe safely:", err);
        }
      }
    };
  }, [channelName]);
}
