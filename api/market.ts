import { handleMarketRequest } from "../src/server/market.ts";

export default function marketHandler(request: Request): Promise<Response> {
  return handleMarketRequest(request);
}
