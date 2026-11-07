import { localNpcReply } from "./localNpc";
export interface AiChatRequest {
  storyId?: string;
  playerId: string;
  thread: string;
  message: string;
  history: { sender: string; body: string; outgoing: boolean }[];
}
export interface AiChatResponse { reply: string; delayMs?: number }
const endpoint = import.meta.env.VITE_CHAT_API_URL as string | undefined;

/** Public frontend never receives the provider API key. */
export async function requestNpcReply(request: AiChatRequest): Promise<AiChatResponse> {
  if (!endpoint) return localNpcReply(request);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`AI 回覆失敗（${response.status}）`);
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("reply" in data) || typeof data.reply !== "string")
      throw new Error("AI 回覆格式錯誤");
    return { reply: data.reply.slice(0, 1500) };
  } finally {
    clearTimeout(timer);
  }
}
