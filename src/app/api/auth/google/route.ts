import { NextResponse } from "next/server";

import { requiredEnv } from "@/lib/env";
import {
  createOAuthState,
  getGoogleRedirectUri,
  getGoogleScopes
} from "@/lib/oauth";

export async function GET() {
  const state = createOAuthState();
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authorizationUrl.searchParams.set("client_id", requiredEnv("GOOGLE_CLIENT_ID"));
  authorizationUrl.searchParams.set("redirect_uri", getGoogleRedirectUri());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", getGoogleScopes().join(" "));
  authorizationUrl.searchParams.set("access_type", "offline");
  authorizationUrl.searchParams.set("prompt", "consent");
  authorizationUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizationUrl);
}
