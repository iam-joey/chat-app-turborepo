import { useUser } from "@repo/store/hooks";
import { useEffect, useState } from "react";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const user = useUser();
  const WebSocketUrl = "ws://localhost:3001";
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`${WebSocketUrl}?token=${user}`);

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return socket;
};
