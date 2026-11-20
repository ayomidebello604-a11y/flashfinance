import { handleMarketRequest } from "../dist/src/server/market.js";

export default function marketHandler(request) {
  return handleMarketRequest(request);
}
