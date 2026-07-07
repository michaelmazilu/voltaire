import { VoltaireMark } from "../../components/VoltaireMark";

const envGroups = [
  {
    title: "Butterbase",
    copy: "Primary data layer, structured rows, search logs, and RAG ingestion.",
    keys: ["NEXT_PUBLIC_BUTTERBASE_APP_ID", "NEXT_PUBLIC_BUTTERBASE_API_URL", "NEXT_PUBLIC_BUTTERBASE_ANON_KEY", "BUTTERBASE_SECRET_KEY"],
  },
  {
    title: "Neo4j",
    copy: "Relationship graph for people, messages, meetings, tasks, sources, and traces.",
    keys: ["NEO4J_URI", "NEO4J_USERNAME", "NEO4J_PASSWORD"],
  },
  {
    title: "Search + LLM",
    copy: "Optional web enrichment and planner/evaluator models.",
    keys: ["EXA_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY"],
  },
];

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F3] px-4 py-8 text-[#37322F]">
      <div className="mx-auto max-w-[1060px] border-x border-[rgba(55,50,47,0.12)] px-4 py-10 shadow-[1px_0_0_white,-1px_0_0_white] sm:px-8">
        <a href="/" className="mb-12 flex items-center gap-2">
          <VoltaireMark className="h-6 w-6 text-[#37322F]" />
          <span className="font-serif text-xl italic">Voltaire</span>
        </a>
        <div className="max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-wide text-[#827C77]">Setup</div>
          <h1 className="mt-3 font-serif text-5xl font-normal leading-tight">Connect real sources.</h1>
          <p className="mt-4 text-base font-medium leading-7 text-[#605A57]">
            Add these to `.env.local`, then restart the dev server. Voltaire does not collect Instagram passwords or session cookies.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {envGroups.map((group) => (
            <section key={group.title} className="rounded-lg border border-[#e0dedb] bg-white p-6">
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <p className="mt-2 min-h-16 text-sm font-medium leading-6 text-[#605A57]">{group.copy}</p>
              <div className="mt-6 space-y-2">
                {group.keys.map((key) => (
                  <code key={key} className="block rounded-md border border-[#e0dedb] bg-[#FBFAF9] px-3 py-2 text-xs font-semibold text-[#37322F]">
                    {key}=
                  </code>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-[#e0dedb] bg-white p-6 text-sm font-medium leading-6 text-[#605A57]">
          Instagram path: use the official Instagram data export and POST parsed message JSON to `/api/ingest/instagram`, or integrate Meta’s official APIs for eligible Business/Creator accounts.
        </div>
      </div>
    </main>
  );
}
