import { GoogleGenAI, Type } from "@google/genai";
import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  "gen-lang-client-0013019253";
const LOCATION = process.env.VERTEX_AI_LOCATION || "us-central1";
const MODEL = "gemini-2.5-flash";
const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

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

function safeTimeZone(timeZone?: string) {
  if (!timeZone) return DEFAULT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function formatPartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>;
}

function getOffsetMinutes(date: Date, timeZone: string) {
  const parts = formatPartsInTimeZone(date, timeZone);
  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return Math.round((zonedAsUtc - date.getTime()) / 60000);
}

function formatOffset(minutes: number) {
  const sign = minutes >= 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const remainder = String(absolute % 60).padStart(2, "0");

  return `${sign}${hours}:${remainder}`;
}

function normalizeLocalDateTime(value: unknown, timeZone: string) {
  if (typeof value !== "string" || !value.trim()) return value;

  const trimmed = value.trim();
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
  );

  if (!match) return trimmed;

  const [, year, month, day, hour, minute, second = "00"] = match;

  // Treat every model timestamp as the local wall-clock time the user said, then attach the real zone offset.
  const probe = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ));
  const offset = formatOffset(getOffsetMinutes(probe, timeZone));

  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
}

function currentLocalReference(timeZone: string) {
  const now = new Date();
  const parts = formatPartsInTimeZone(now, timeZone);
  const offset = formatOffset(getOffsetMinutes(now, timeZone));

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

function buildInstruction(timeZone: string) {
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
- O usuario fala no fuso ${timeZone}.
- Converta termos relativos para ISO 8601 com offset explicito do fuso local.
- Preserve o horario falado pelo usuario. Exemplo: se ele disser "20h50", retorne 20:50 no horario local, nunca converta para UTC.
- Nunca retorne "Z" quando houver horario local falado; use offset, por exemplo "2026-05-14T20:50:00-03:00".

INSIGHT:
- Gere um insight empatico e executavel de 1 frase para reduzir paralisia de decisao.

DATA DE REFERENCIA LOCAL: ${currentLocalReference(timeZone)}.`;
}

function normalizeJsonText(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
}

async function generateWithVertex(text: string, timeZone: string) {
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
        parts: [{ text: buildInstruction(timeZone) }]
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

async function generateWithApiKey(text: string, timeZone: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ausente.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
      contents: text,
      config: {
        systemInstruction: buildInstruction(timeZone),
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
    const { text, timeZone } = (await request.json().catch(() => ({}))) as {
      text?: string;
      timeZone?: string;
    };

    if (!text?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Texto ausente." },
        { status: 400 }
      );
    }

    const userTimeZone = safeTimeZone(timeZone);
    let data: {
      dataHoraDetectada?: string;
      local?: string;
      mapsUrl?: string;
      wazeUrl?: string;
    };

    try {
      data = await generateWithVertex(text, userTimeZone);
    } catch {
      data = await generateWithApiKey(text, userTimeZone);
    }

    data.dataHoraDetectada = normalizeLocalDateTime(
      data.dataHoraDetectada,
      userTimeZone
    ) as string | undefined;

    if (
      typeof data.local === "string" &&
      ["", "null", "undefined", "n/a", "nao informado"].includes(
        data.local.trim().toLowerCase()
      )
    ) {
      data.local = undefined;
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
