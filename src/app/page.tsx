"use client";

import { FormEvent, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  category: string;
  priority: "media" | "alta" | "baixa";
  mode: "focar" | "organizar" | "executar";
  date: string;
  location?: string;
  insight: string;
  done: boolean;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Ir ao Mercadao da Lapa",
    category: "compromisso",
    priority: "media",
    mode: "focar",
    date: "15 de mai., 16:00",
    location: "Mercadao da Lapa",
    insight:
      "Coloque um alarme 1 hora antes para garantir que voce saia com calma e aproveite o passeio sem pressa.",
    done: false
  },
  {
    id: 2,
    title: "Comprar pneu com a medida certa no AutoZone",
    category: "compra",
    priority: "media",
    mode: "focar",
    date: "Hoje, 18:30",
    location: "AutoZone",
    insight:
      "Fotografe a medida do pneu antes de sair. Isso evita ida e volta e deixa a compra mais objetiva.",
    done: false
  },
  {
    id: 3,
    title: "Separar documentos para consulta",
    category: "saude",
    priority: "alta",
    mode: "organizar",
    date: "Amanha, 09:00",
    insight:
      "Deixe tudo em uma pasta unica e anote em uma frase o principal assunto que voce quer resolver.",
    done: true
  }
];

const tabs = ["Captura", "Hoje", "Dashboard", "Historico"] as const;

export default function Home() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Hoje");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const todayTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return tasks;
    }

    return tasks.filter((task) =>
      [task.title, task.category, task.location, task.insight]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, tasks]);

  const doneCount = tasks.filter((task) => task.done).length;
  const progress = Math.round((doneCount / tasks.length) * 100);
  const focusCount = tasks.filter((task) => !task.done).length;

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = draft.trim();

    if (!title) {
      return;
    }

    setTasks((current) => [
      {
        id: Date.now(),
        title,
        category: "captura",
        priority: "baixa",
        mode: "executar",
        date: "Hoje",
        insight:
          "Transforme esta captura em uma proxima acao pequena antes de partir para outra coisa.",
        done: false
      },
      ...current
    ]);
    setDraft("");
    setActiveTab("Hoje");
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function removeTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <main className="workspace">
      <h1 className="app-title">2º Cérebro TDAH</h1>
      <section className="phone-shell" aria-label="2 Cerebro TDAH">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">
            ||
          </div>
          <nav className="tabs" aria-label="Navegacao principal">
            {tabs.map((tab) => (
              <button
                className={`tab ${activeTab === tab ? "active" : ""}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
                {tab === "Hoje" ? ` (${focusCount})` : ""}
              </button>
            ))}
          </nav>
          <div className="top-actions" aria-label="Acoes">
            <a className="icon-link" href="/api/auth/google" title="Entrar">
              &gt;
            </a>
            <a className="icon-link" href="/api/health" title="Status">
              *
            </a>
          </div>
        </header>

        <section className="progress-area" aria-label="Progresso">
          <div className="progress-copy">
            <span>Vamos comecar com algo pequeno?</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>
        </section>

        <form className="capture-form" onSubmit={addTask}>
          <label className="search-box">
            <span aria-hidden="true">+</span>
            <input
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Capturar uma tarefa..."
              value={draft}
            />
          </label>
          <button className="quick-add" type="submit">
            Adicionar
          </button>
        </form>

        <label className="search-box main-search">
          <span aria-hidden="true">o</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar em tudo..."
            value={query}
          />
        </label>

        {activeTab === "Dashboard" ? (
          <section className="dashboard" aria-label="Dashboard">
            <article>
              <span className="metric-label">Concluidas</span>
              <strong>{doneCount}</strong>
            </article>
            <article>
              <span className="metric-label">Em foco</span>
              <strong>{focusCount}</strong>
            </article>
            <article>
              <span className="metric-label">Clareza</span>
              <strong>{progress}%</strong>
            </article>
          </section>
        ) : (
          <section className="task-list" aria-label="Lista de tarefas">
            {todayTasks.map((task) => (
              <article className={`task-card ${task.done ? "done" : ""}`} key={task.id}>
                <div className="task-card-top">
                  <div className="chips">
                    <span className="chip category">{task.category}</span>
                    <span className={`chip ${task.priority}`}>{task.priority}</span>
                  </div>
                  <button
                    className="remove"
                    onClick={() => removeTask(task.id)}
                    title="Remover"
                    type="button"
                  >
                    x
                  </button>
                </div>

                <div className="task-title-row">
                  <button
                    aria-label={task.done ? "Marcar como pendente" : "Marcar como feita"}
                    className="check"
                    onClick={() => toggleTask(task.id)}
                    type="button"
                  />
                  <h2>{task.title}</h2>
                </div>

                <div className="focus-line">
                  <strong>@ {task.mode}</strong>
                  <span>{task.date}</span>
                </div>

                <p className="insight">{task.insight}</p>

                <footer className="task-footer">
                  <span>{task.date}</span>
                  {task.location ? <span>{task.location}</span> : null}
                </footer>
              </article>
            ))}
          </section>
        )}

        <button
          className="floating-add"
          onClick={() => setActiveTab("Captura")}
          title="Nova tarefa"
          type="button"
        >
          +
        </button>
      </section>
    </main>
  );
}
