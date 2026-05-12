import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { getBaseUrl, requiredEnv } from "@/lib/env";

const defaultScopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar.events"
];

export function getGoogleRedirectUri() {
  return `${getBaseUrl()}/api/auth/callback/google`;
}

export function getGoogleScopes() {
  return (process.env.GOOGLE_OAUTH_SCOPES || defaultScopes.join(" "))
    .split(/\s+/)
    .filter(Boolean);
}

export function createOAuthState() {
  const nonce = randomBytes(24).toString("base64url");
  const signature = signState(nonce);

  return `${nonce}.${signature}`;
}

export function verifyOAuthState(state: string) {
  const [nonce, signature] = state.split(".");

  if (!nonce || !signature) {
    return false;
  }

  const expected = signState(nonce);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function signState(nonce: string) {
  return createHmac("sha256", requiredEnv("AUTH_SECRET"))
    .update(nonce)
    .digest("base64url");
}
