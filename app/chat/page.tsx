import { ChatShell } from "../../components/ChatShell";

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params?.q ?? "";

  return (
    <main className="min-h-screen bg-[#F7F5F3] text-[#37322F]">
      <ChatShell initialQuery={initialQuery} />
    </main>
  );
}
