import { NextResponse } from "next/server";

import { requiredEnv } from "@/lib/env";

type GeminiRequest = {
  prompt?: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = requiredEnv("GEMINI_API_KEY");
    const body = (await request.json().catch(() => ({}))) as GeminiRequest;
    const prompt =
      body.prompt ||
      "Responda em portugues com uma frase curta confirmando que o SmartFlow AI esta conectado.";

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
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
