import { ChatInterface } from "../../components/ChatInterface";
import { VoltaireMark } from "../../components/VoltaireMark";
import {
  Compass,
  Edit3,
  LifeBuoy,
  PanelLeft,
  Search,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = [LucideIcon, string, boolean];
type FooterItem = [LucideIcon, string];

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params?.q ?? "";
  const navItems: NavItem[] = [
    [Edit3, "New chat", true],
    [Search, "Search chats", false],
  ];
  const footerItems: FooterItem[] = [
    [Compass, "Sources"],
    [Settings, "Settings"],
    [LifeBuoy, "Help"],
  ];

  return (
    <main className="min-h-screen bg-[#F7F5F3] text-[#37322F]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[312px] shrink-0 flex-col border-r border-[rgba(55,50,47,0.12)] bg-[#EFEBE7] px-2 py-3 shadow-[1px_0_0_white] md:flex">
          <div className="mb-5 flex items-center justify-between px-3">
            <a href="/" aria-label="Voltaire home">
              <VoltaireMark className="h-6 w-6 text-[#37322F]" />
            </a>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#605A57] transition hover:bg-white hover:text-[#37322F]"
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <nav className="space-y-1 text-[15px] font-medium text-[#37322F]">
            {navItems.map(([Icon, label, active]) => (
              <a
                key={label}
                href={active ? "/chat" : "#"}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 transition ${
                  active ? "bg-white text-[#37322F] shadow-[0_1px_2px_rgba(55,50,47,0.06)]" : "text-[#605A57] hover:bg-white hover:text-[#37322F]"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {String(label)}
              </a>
            ))}
          </nav>

          <div className="mt-auto space-y-1 border-t border-[rgba(55,50,47,0.12)] pt-3 text-[15px] font-medium text-[#605A57]">
            {footerItems.map(([Icon, label]) => (
              <a
                key={label}
                href={label === "Sources" ? "/setup" : "#"}
                className="flex h-11 items-center gap-3 rounded-lg px-3 transition hover:bg-white hover:text-[#37322F]"
              >
                <Icon className="h-5 w-5" aria-hidden />
                {String(label)}
              </a>
            ))}
          </div>
        </aside>

        <section className="relative flex h-screen min-w-0 flex-1 flex-col">
          <header className="absolute left-0 right-0 top-0 z-10 flex h-16 items-center justify-between bg-[#F7F5F3] px-4 md:px-6">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-2 rounded-lg px-2 py-2 font-serif text-2xl italic text-[#2F3037] transition hover:bg-white">
                <span>Voltaire</span>
              </a>
            </div>
            <a
              href="/setup"
              className="rounded-full bg-[#37322F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2A2520]"
            >
              Integration
            </a>
          </header>

          <ChatInterface initialQuery={initialQuery} />
        </section>
      </div>
    </main>
  );
}
