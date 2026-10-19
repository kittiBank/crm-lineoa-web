export interface ServerSentEvent {
  type: string;
  data: string;
}

/**
 * Reads a `text/event-stream` body until it ends or the signal aborts.
 * Fetch is used instead of EventSource so the JWT can go in the
 * Authorization header rather than the URL.
 */
export async function readEventStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ServerSentEvent) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) return;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n?/g, "\n");
    let boundary = buffer.indexOf("\n\n");

    while (boundary !== -1) {
      const event = parseEvent(buffer.slice(0, boundary));
      if (event) onEvent(event);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
  }
}

function parseEvent(block: string): ServerSentEvent | null {
  let type = "message";
  const data: string[] = [];

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");

    if (field === "event") type = value;
    else if (field === "data") data.push(value);
  }

  return data.length > 0 ? { type, data: data.join("\n") } : null;
}
