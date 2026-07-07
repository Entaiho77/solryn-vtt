import WebSocket from 'ws';

/**
 * Main-process WebSocket connection to the relay server. Lives in the Electron main process (not
 * the renderer) so the desktop app can talk to the relay with a real Node socket. Incoming
 * messages are handed to `onMessage`, which the main process forwards to the renderer over IPC.
 * Reconnects automatically up to `maxRetries` times if the socket drops unexpectedly.
 */
export class RelayClient {
  private ws: WebSocket | null = null;
  private retries = 0;
  private readonly maxRetries = 3;
  private closedByUser = false;

  constructor(
    private readonly url: string,
    private readonly onMessage: (message: unknown) => void,
  ) {}

  /** Open the connection. Resolves once connected, rejects if the first attempt fails. */
  connect(): Promise<void> {
    this.closedByUser = false;
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.on('open', () => {
        this.retries = 0;
        console.log(`[relay-client] connected to ${this.url}`);
        resolve();
      });

      ws.on('message', (raw) => {
        const text = raw.toString();
        try {
          this.onMessage(JSON.parse(text));
        } catch {
          this.onMessage(text); // pass through non-JSON payloads unchanged
        }
      });

      ws.on('close', () => {
        if (!this.closedByUser) this.scheduleReconnect();
      });

      ws.on('error', (err) => {
        console.error(`[relay-client] socket error: ${err.message}`);
        // Only reject the initial connect(); later errors are handled by the close→reconnect path.
        if (this.retries === 0 && this.ws === ws) reject(err);
      });
    });
  }

  private scheduleReconnect(): void {
    if (this.retries >= this.maxRetries) {
      console.error(`[relay-client] gave up reconnecting after ${this.maxRetries} attempts`);
      return;
    }
    this.retries += 1;
    const delayMs = 500 * this.retries; // simple linear backoff: 0.5s, 1s, 1.5s
    console.log(`[relay-client] reconnecting (attempt ${this.retries}/${this.maxRetries}) in ${delayMs}ms`);
    setTimeout(() => {
      this.connect().catch(() => {
        /* handled by the next close→reconnect cycle */
      });
    }, delayMs);
  }

  /** Send a JSON-serialisable message if the socket is open. */
  send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(message));
  }

  /** Close intentionally (no reconnect). */
  close(): void {
    this.closedByUser = true;
    this.ws?.close();
    this.ws = null;
  }
}
