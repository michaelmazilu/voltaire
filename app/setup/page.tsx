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
    copy: "Optional web enrichment and RocketRide-first planner/evaluator model.",
    keys: ["EXA_API_KEY", "ROCKETRIDE_APIKEY", "ROCKETRIDE_URI", "ROCKETRIDE_MODEL", "BASETEN_API_KEY"],
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
            Add these to `.env.local`, then restart the dev server. Set `VOLTAIRE_DATA_MODE=demo` for seeded demo data or `production` for real integrations. Voltaire does not collect Instagram passwords or session cookies.
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
          <h2 className="text-sm font-semibold text-[#37322F]">Instagram import</h2>
          <p className="mt-2">
            Use Instagram&apos;s official data export. Upload one or more `message_*.json` files from the export; Voltaire will ingest them into Butterbase and Neo4j.
          </p>
          <form action="/api/ingest/instagram" method="post" encType="multipart/form-data" className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input name="files" type="file" accept="application/json,.json" multiple className="rounded-md border border-[#e0dedb] bg-[#FBFAF9] px-3 py-2 text-sm" />
            <button className="rounded-md bg-[#37322F] px-5 py-2 text-sm font-semibold text-white">Import messages</button>
          </form>
          <p className="mt-3 text-xs text-[#827C77]">
            No headless Instagram login, passwords, or session cookies are collected.
          </p>
        </div>
      </div>
    </main>
  );
}
