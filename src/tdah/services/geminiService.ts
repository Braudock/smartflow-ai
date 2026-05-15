export enum BrainType {
  IDEIA = "IDEIA",
  COMPRA = "COMPRA",
  LEMBRETE = "LEMBRETE",
  TAREFA = "TAREFA",
  INSIGHT = "INSIGHT",
  REFLEXAO = "REFLEXAO",
  SENTIMENTO = "SENTIMENTO",
  COMPROMISSO = "COMPROMISSO",
  FINANCAS = "FINANCAS",
  REFERENCIA = "REFERENCIA",
}

export enum BrainPriority {
  ALTA = "ALTA",
  MEDIA = "MEDIA",
  BAIXA = "BAIXA",
}

export enum BrainStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export interface BrainEntry {
  id: string;
  timestamp: string;
  tipo: BrainType;
  prioridade: BrainPriority;
  conteudo: string;
  dataHoraDetectada?: string | null;
  local?: string | null;
  insight: string;
  tags: string[];
  mapsUrl?: string | null;
  wazeUrl?: string | null;
  status?: BrainStatus;
  hasPendingWrites?: boolean;
}

export async function processInput(text: string): Promise<Partial<BrainEntry>> {
  if (!text.trim()) {
    throw new Error("Input text is empty");
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  const response = await fetch("/api/gemini/process", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ text, timeZone })
  });

  const payload = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: Partial<BrainEntry>;
    error?: string;
  };

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.error || "Falha ao processar com Gemini.");
  }

  return payload.data;
}
