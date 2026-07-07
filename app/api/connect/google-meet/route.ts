import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

export async function POST(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_MEET_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({
      source: "google_meet",
      status: "not_configured",
      message: "Google Meet connection is staged. Add GOOGLE_CLIENT_ID and GOOGLE_MEET_REDIRECT_URI to enable OAuth.",
      requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_MEET_REDIRECT_URI"],
    });
  }

  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: JSON.stringify({ source: "google_meet", returnTo: `${origin}/setup` }),
  });

  return NextResponse.json({
    source: "google_meet",
    status: "redirect_ready",
    authUrl: `${GOOGLE_AUTH_URL}?${params.toString()}`,
  });
}
