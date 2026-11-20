import { handleGeminiRequest } from "../src/server/gemini.ts";

export default function aiHandler(request: Request): Promise<Response> {
  return handleGeminiRequest(request);
}
