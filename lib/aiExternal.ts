// OPSIONAL: memanggil API AI eksternal bila ANTHROPIC_API_KEY diatur di server.
// Jika tidak diatur atau gagal, fungsi mengembalikan null dan aplikasi memakai mode lokal.

export function externalAiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function askExternalAi(prompt: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text;
    return text ?? null;
  } catch {
    return null;
  }
}
