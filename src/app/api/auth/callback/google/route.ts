import { NextResponse } from "next/server";

import { requiredEnv } from "@/lib/env";
import { getGoogleRedirectUri, verifyOAuthState } from "@/lib/oauth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  if (!code || !state || !verifyOAuthState(state)) {
    return NextResponse.json(
      { ok: false, error: "Callback OAuth invalido." },
      { status: 400 }
    );
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  const tokenPayload = (await tokenResponse.json()) as {
    access_token?: string;
    expires_in?: number;
    id_token?: string;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: tokenPayload.error || "Falha ao trocar codigo OAuth.",
        description: tokenPayload.error_description
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    tokenType: tokenPayload.token_type,
    expiresIn: tokenPayload.expires_in,
    scopes: tokenPayload.scope,
    hasAccessToken: Boolean(tokenPayload.access_token),
    hasRefreshToken: Boolean(tokenPayload.refresh_token),
    hasIdToken: Boolean(tokenPayload.id_token)
  });
}
