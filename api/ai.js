import { handleGeminiRequest } from "../dist/src/server/gemini.js";

export default function aiHandler(request) {
  return handleGeminiRequest(request);
}
