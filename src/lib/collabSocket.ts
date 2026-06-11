import { resolveWsUrl } from '@/lib/ws';

export type CollabConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

type MessageHandler = (data: string) => void;
type StatusHandler = (status: CollabConnectionStatus) => void;

/**
 * Reconnecting WebSocket for org-wide live collaboration.
 * Stays connected while `enabled` is true (typically for the whole signed-in session).
 */
export class CollabSocket {
  private ws: WebSocket | null = null;
  private url = '';
  private enabled = false;
  private reconnectAttempt = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private messageHandlers = new Set<MessageHandler>();
  private statusHandlers = new Set<StatusHandler>();

  connect(url: string, enabled: boolean) {
    this.url = url;
    this.enabled = enabled;
    if (!enabled) {
      this.teardown();
      this.setStatus('closed');
      return;
    }
    this.open();
  }

  private setStatus(status: CollabConnectionStatus) {
    for (const h of this.statusHandlers) h(status);
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  send(payload: unknown): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify(payload));
    return true;
  }

  get ready() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private open() {
    this.teardown(false);
    if (!this.url || !this.enabled) return;

    this.setStatus('connecting');
    const ws = new WebSocket(resolveWsUrl(this.url));
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus('open');
      this.heartbeatTimer = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 15000);
    };

    ws.onmessage = (ev) => {
      for (const h of this.messageHandlers) {
        try {
          h(String(ev.data));
        } catch {
          // ignore
        }
      }
    };

    ws.onerror = () => this.setStatus('error');

    ws.onclose = () => {
      this.clearHeartbeat();
      this.ws = null;
      if (!this.enabled) {
        this.setStatus('closed');
        return;
      }
      this.setStatus('closed');
      const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 15000);
      this.reconnectAttempt += 1;
      this.reconnectTimer = window.setTimeout(() => this.open(), delay);
    };
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer != null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private teardown(clearReconnect = true) {
    this.clearHeartbeat();
    if (clearReconnect && this.reconnectTimer != null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;
  }
}
