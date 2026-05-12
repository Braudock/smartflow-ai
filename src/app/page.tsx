import { getEnvStatus } from "@/lib/env";

const nextSteps = [
  "Criar repositorio GitHub smartflow-ai e enviar este codigo.",
  "Criar backend Firebase App Hosting conectado ao GitHub.",
  "Criar secrets do ambiente no Google Cloud Secret Manager.",
  "Adicionar a URL publica do Firebase no OAuth Google.",
  "Rodar testes Gemini, Gmail, Drive, Sheets e Calendar."
];

export default function Home() {
  const envStatus = getEnvStatus();

  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow">Base tecnica inicial</div>
        <h1>SmartFlow AI</h1>
        <p>
          Painel inicial para validar ambiente, iniciar OAuth Google e testar
          Gemini antes do primeiro deploy no Firebase App Hosting.
        </p>
        <div className="actions">
          <a className="button" href="/api/auth/google">
            Entrar com Google
          </a>
          <a className="button secondary" href="/api/health">
            Health check
          </a>
        </div>
      </section>

      <section className="grid" aria-label="Status do projeto">
        <article className="card">
          <h2>Variaveis</h2>
          <ul className="status-list">
            {envStatus.map((item) => (
              <li className="status-row" key={item.key}>
                <span className={`pill ${item.configured ? "ok" : "warn"}`}>
                  {item.configured ? "ok" : "pendente"}
                </span>
                <span>
                  <span className="item-title">{item.key}</span>
                  <br />
                  <span className="item-desc">{item.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Rotas prontas</h2>
          <p>
            <code>/api/health</code>, <code>/api/gemini/test</code>,{" "}
            <code>/api/auth/google</code> e{" "}
            <code>/api/auth/callback/google</code>.
          </p>
        </article>

        <article className="card">
          <h2>Proximos passos</h2>
          <ul className="status-list">
            {nextSteps.map((step) => (
              <li className="item-desc" key={step}>
                {step}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
