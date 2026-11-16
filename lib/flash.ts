import { redirect } from "next/navigation";

// Mengalihkan ke path dengan pesan sukses (msg) atau galat (error) pada query string.
export function go(path: string, kind: "msg" | "error", message: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${kind}=${encodeURIComponent(message)}`);
}
