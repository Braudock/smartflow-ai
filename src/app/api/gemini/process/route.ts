import { GoogleGenAI, Type } from "@google/genai";
import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  "gen-lang-client-0013019253";
const LOCATION = process.env.VERTEX_AI_LOCATION || "us-central1";
const MODEL = "gemini-2.5-flash";

const responseSchema = {
  type: "OBJECT",
  properties: {
    tipo: {
      type: "STRING",
      enum: [
        "IDEIA",
        "COMPRA",
        "LEMBRETE",
        "TAREFA",
        "INSIGHT",
        "REFLEXAO",
        "SENTIMENTO",
        "COMPROMISSO",
        "FINANCAS",
        "REFERENCIA"
      ]
    },
    prioridade: {
      type: "STRING",
      enum: ["ALTA", "MEDIA", "BAIXA"]
    },
    conteudo: { type: "STRING" },
    dataHoraDetectada: { type: "STRING" },
    local: { type: "STRING" },
    insight: { type: "STRING" },
    tags: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["tipo", "prioridade", "conteudo", "insight", "tags"]
};

function buildInstruction() {
  return `Voce e o processador do "2o Cerebro TDAH". Extraia informacoes estruturadas de textos rapidos, verbosos ou desordenados de pessoas com TDAH.

CRITERIOS DE PRIORIDADE:
- ALTA: textos com "urgente", "agora", "nao esquecer", "importante", prazos proximos, ou tom de ansiedade.
- MEDIA: tarefas do dia a dia, lembretes padrao, ou quando nao houver indicacao clara de urgencia.
- BAIXA: ideias para o futuro, reflexoes, sentimentos ou coisas "quando der".

EXTRACAO DE LOCAL:
- Extraia nomes de estabelecimentos, ruas, numeros, bairros ou cidades.
- Se houver local fisico no texto, preencha local.
- O campo local deve ser amigavel para Google Maps.

DATA/HORA:
- Converta termos relativos para ISO baseado na data atual.

INSIGHT:
- Gere um insight empatico e executavel de 1 frase para reduzir paralisia de decisao.

DATA DE REFERENCIA: ${new Date().toISOString()}.`;
}

function normalizeJsonText(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
}

async function generateWithVertex(text: string) {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  if (!accessToken.token) {
    throw new Error("Token Vertex AI ausente.");
  }

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildInstruction() }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema
      }
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message || `Vertex AI retornou HTTP ${response.status}.`;
    throw new Error(message);
  }

  const output =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("") || "{}";

  return JSON.parse(normalizeJsonText(output));
}

async function generateWithApiKey(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ausente.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
      contents: text,
      config: {
        systemInstruction: buildInstruction(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tipo: {
              type: Type.STRING,
              enum: [
                "IDEIA",
                "COMPRA",
                "LEMBRETE",
                "TAREFA",
                "INSIGHT",
                "REFLEXAO",
                "SENTIMENTO",
                "COMPROMISSO",
                "FINANCAS",
                "REFERENCIA"
              ]
            },
            prioridade: {
              type: Type.STRING,
              enum: ["ALTA", "MEDIA", "BAIXA"]
            },
            conteudo: { type: Type.STRING },
            dataHoraDetectada: { type: Type.STRING },
            local: { type: Type.STRING },
            insight: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["tipo", "prioridade", "conteudo", "insight", "tags"]
        }
      }
    });

  return JSON.parse(normalizeJsonText(response.text || "{}"));
}

export async function POST(request: Request) {
  try {
    const { text } = (await request.json().catch(() => ({}))) as { text?: string };

    if (!text?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Texto ausente." },
        { status: 400 }
      );
    }

    let data: {
      local?: string;
      mapsUrl?: string;
      wazeUrl?: string;
    };

    try {
      data = await generateWithVertex(text);
    } catch {
      data = await generateWithApiKey(text);
    }

    if (data.local) {
      const query = encodeURIComponent(data.local);
      data.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      data.wazeUrl = `https://waze.com/ul?q=${query}`;
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
