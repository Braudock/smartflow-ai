import { NextResponse } from "next/server";

import { getBaseUrl, getEnvStatus } from "@/lib/env";
import { getGoogleRedirectUri, getGoogleScopes } from "@/lib/oauth";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "smartflow-ai",
    baseUrl: getBaseUrl(),
    googleRedirectUri: getGoogleRedirectUri(),
    googleScopes: getGoogleScopes(),
    env: getEnvStatus().map((item) => ({
      key: item.key,
      configured: item.configured
    }))
  });
}
