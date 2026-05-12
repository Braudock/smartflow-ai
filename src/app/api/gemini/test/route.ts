import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";

type GeminiRequest = {
  prompt?: string;
};

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  "gen-lang-client-0013019253";
const LOCATION = process.env.VERTEX_AI_LOCATION || "us-central1";
const MODEL = "gemini-2.5-flash";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as GeminiRequest;
    const prompt =
      body.prompt ||
      "Responda em portugues com uma frase curta confirmando que o SmartFlow AI esta conectado.";
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Token Vertex AI ausente.");
    }

    const geminiResponse = await fetch(
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken.token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 120
          }
        })
      }
    );

    const payload = (await geminiResponse.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
      error?: {
        message?: string;
      };
    };

    if (!geminiResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: payload.error?.message || "Falha ao chamar Gemini."
        },
        { status: geminiResponse.status }
      );
    }

    const text =
      payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("\n") || "";

    return NextResponse.json({
      ok: true,
      text
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}
