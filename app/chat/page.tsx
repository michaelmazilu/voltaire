import { ChatInterface } from "../../components/ChatInterface";
import { VoltaireMark } from "../../components/VoltaireMark";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[#F7F5F3] text-[#37322F]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-4 py-4 sm:px-6">
        <header className="mb-4 flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <VoltaireMark className="h-7 w-7 text-[#37322F]" />
            <span className="font-serif text-2xl italic leading-none text-[#2F3037]">Voltaire</span>
          </a>
          <a
            href="/setup"
            className="rounded-full bg-[#37322F] px-4 py-2 text-[13px] font-medium leading-none text-white shadow-[0_1px_2px_rgba(55,50,47,0.12)] transition hover:bg-[#2A2520]"
          >
            Integration
          </a>
        </header>

        <ChatInterface fullHeight />
      </div>
    </main>
  );
}
