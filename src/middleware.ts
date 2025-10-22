import { paymentMiddleware } from "x402-next";
import { facilitator } from "@coinbase/x402";
import { x402RoutesConfig } from "./lib/x402-routes";

const RECIPIENT_ADDRESS = "0xfbd7b7Ed48146aD9bEfF956212c77cE056815ad0";

export const middleware = paymentMiddleware(
  RECIPIENT_ADDRESS,
  x402RoutesConfig,
  facilitator,
);

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/x402/:path*"],
  runtime: "nodejs",
};
