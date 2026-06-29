"use client";

import { useCallback, useEffect, useRef } from "react";

type WebSocketEvent = Record<string, unknown>;

interface UseWebSocketOptions {
  onEvent?: (event: WebSocketEvent) => void;
}

export function useWebSocket(url: string, { onEvent }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEventRef = useRef(onEvent);
  const mountedRef = useRef(true);

  // Keep callback ref in sync without re-triggering effect
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Clean up any previous connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("[WS] Connected:", url);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WebSocketEvent;
        onEventRef.current?.(data);
      } catch {
        console.warn("[WS] Failed to parse message:", event.data);
      }
    };

    ws.onerror = (err) => {
      console.warn("[WS] Error:", err);
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected. Reconnecting in 3s...");
      wsRef.current = null;
      if (mountedRef.current) {
        reconnectTimerRef.current = setTimeout(connect, 3000);
      }
    };

    wsRef.current = ws;
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
