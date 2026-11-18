export type AiAction = "research" | "strategy" | "news" | "sentiment" | "risk";

export async function requestAi<T>(
  action: AiAction,
  input: Record<string, string>,
): Promise<T> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...input }),
  });

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error("The AI server returned an invalid response.");
  }

  const errorMessage =
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
      ? result.error
      : `AI request failed with status ${response.status}.`;

  if (!response.ok) throw new Error(errorMessage);
  return result as T;
}
