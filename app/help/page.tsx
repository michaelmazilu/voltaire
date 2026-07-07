import { ArrowLeft, MessageCircle, Plug, Search } from "lucide-react";
import { VoltaireMark } from "../../components/VoltaireMark";

const helpItems = [
  {
    title: "Ask better questions",
    copy: "Use natural language and include the person, topic, or timeframe you want Voltaire to search across connected sources.",
    Icon: MessageCircle,
  },
  {
    title: "Connect integrations",
    copy: "Add Instagram exports or prepare Google Meet access from the Integration page before expecting real source results.",
    Icon: Plug,
  },
  {
    title: "Review evidence",
    copy: "Answers are only as strong as the retrieved evidence. Check citations and source cards when a response feels incomplete.",
    Icon: Search,
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F3] px-4 py-8 text-[#37322F]">
      <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[1060px] border-x border-[rgba(55,50,47,0.12)] px-4 py-10 shadow-[1px_0_0_white,-1px_0_0_white] sm:px-8">
        <header className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <VoltaireMark className="h-6 w-6 text-[#37322F]" />
            <span className="font-serif text-xl italic">Voltaire</span>
          </a>
          <a
            href="/chat"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(55,50,47,0.15)] bg-white px-4 py-2 text-sm font-semibold text-[#37322F] transition hover:bg-[#F0EEEC]"
          >
            <ArrowLeft className="h-4 w-4" />
            Chat
          </a>
        </header>

        <section className="mt-16 max-w-2xl">
          <div className="text-xs font-medium uppercase text-[#827C77]">Help</div>
          <h1 className="mt-3 font-serif text-5xl font-normal leading-tight">Use Voltaire with real sources.</h1>
          <p className="mt-4 text-base font-medium leading-7 text-[#605A57]">
            Start with integrations, ask focused questions, and use the returned evidence to verify what Voltaire found.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {helpItems.map(({ title, copy, Icon }) => (
            <article key={title} className="rounded-lg border border-[#e0dedb] bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F7F5F3] text-[#37322F]">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-5 text-sm font-semibold">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-[#605A57]">{copy}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
