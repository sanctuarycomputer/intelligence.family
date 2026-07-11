import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship the encrypted .env inside each serverless bundle so instrumentation.ts
  // can decrypt it at runtime with DOTENV_PRIVATE_KEY. Every function that reads
  // a secret (SESSION_SECRET, RESEND_*, STACKS_API_KEY) needs it traced in.
  outputFileTracingIncludes: {
    "/api/request-code": ["./.env"],
    "/api/verify-code": ["./.env"],
    "/api/gate-status": ["./.env"],
    "/api/subscribe": ["./.env"],
  },
};

export default nextConfig;
