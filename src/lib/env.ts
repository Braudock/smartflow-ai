export type EnvStatus = {
  key: string;
  configured: boolean;
  description: string;
};

export function getBaseUrl() {
  return process.env.AUTH_URL || "http://localhost:3000";
}

export function getEnvStatus(): EnvStatus[] {
  return [
    {
      key: "GEMINI_API_KEY",
      configured: Boolean(process.env.GEMINI_API_KEY),
      description: "Chave Gemini do ambiente atual."
    },
    {
      key: "GOOGLE_CLIENT_ID",
      configured: Boolean(process.env.GOOGLE_CLIENT_ID),
      description: "Client ID do OAuth Google."
    },
    {
      key: "GOOGLE_CLIENT_SECRET",
      configured: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      description: "Client Secret do OAuth Google."
    },
    {
      key: "AUTH_SECRET",
      configured: Boolean(process.env.AUTH_SECRET),
      description: "Segredo local para assinar state do OAuth."
    },
    {
      key: "AUTH_URL",
      configured: Boolean(process.env.AUTH_URL),
      description: "URL publica do app no ambiente atual."
    }
  ];
}

export function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }

  return value;
}
