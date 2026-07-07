"use client";

import {
  Compass,
  Edit3,
  LifeBuoy,
  MessageSquare,
  PanelLeft,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatInterface, type ChatMessage } from "./ChatInterface";
import { VoltaireMark } from "./VoltaireMark";

type SavedChat = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const STORAGE_KEY = "voltaire.savedChats.v1";

function createChat(title = "New chat"): SavedChat {
  return {
    id: crypto.randomUUID(),
    title,
    updatedAt: Date.now(),
    messages: [],
  };
}

function titleFromMessages(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage || firstUserMessage.role !== "user") return "New chat";
  return firstUserMessage.content.length > 42 ? `${firstUserMessage.content.slice(0, 39)}...` : firstUserMessage.content;
}

function readSavedChats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as SavedChat[]) : [];
  } catch {
    return [];
  }
}

export function ChatShell({ initialQuery = "" }: { initialQuery?: string }) {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const chats = readSavedChats();
    const initialChat = chats[0] ?? createChat(initialQuery ? initialQuery : "New chat");
    const nextChats = chats.length ? chats : [initialChat];

    setSavedChats(nextChats);
    setActiveChatId(initialChat.id);
  }, [initialQuery]);

  useEffect(() => {
    if (!savedChats.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedChats));
  }, [savedChats]);

  const activeChat = useMemo(
    () => savedChats.find((chat) => chat.id === activeChatId) ?? savedChats[0],
    [activeChatId, savedChats],
  );

  const visibleChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sorted = [...savedChats].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!query) return sorted;
    return sorted.filter((chat) => chat.title.toLowerCase().includes(query));
  }, [savedChats, searchQuery]);

  function startNewChat() {
    const chat = createChat();
    setSavedChats((current) => [chat, ...current]);
    setActiveChatId(chat.id);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function deleteChat(chatId: string) {
    setSavedChats((current) => {
      const remaining = current.filter((chat) => chat.id !== chatId);

      if (!remaining.length) {
        const replacement = createChat();
        setActiveChatId(replacement.id);
        return [replacement];
      }

      if (chatId === activeChatId) {
        setActiveChatId(remaining[0].id);
      }

      return remaining;
    });
  }

  const updateActiveChat = useCallback((messages: ChatMessage[]) => {
    if (!activeChat) return;

    setSavedChats((current) =>
      current.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              title: titleFromMessages(messages),
              updatedAt: Date.now(),
              messages,
            }
          : chat,
      ),
    );
  }, [activeChat]);

  return (
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
          <button
            type="button"
            onClick={startNewChat}
            className="flex h-11 w-full items-center gap-3 rounded-lg bg-white px-3 text-left text-[#37322F] shadow-[0_1px_2px_rgba(55,50,47,0.06)] transition hover:bg-white"
          >
            <Edit3 className="h-5 w-5" aria-hidden />
            New chat
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[#605A57] transition hover:bg-white hover:text-[#37322F]"
          >
            <Search className="h-5 w-5" aria-hidden />
            Search chats
          </button>
        </nav>

        {searchOpen ? (
          <input
            className="mt-3 h-10 rounded-lg border border-[rgba(55,50,47,0.14)] bg-white px-3 text-sm font-medium text-[#37322F] outline-none placeholder:text-[#9B948E]"
            placeholder="Search saved chats"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            autoFocus
          />
        ) : null}

        <section className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-[rgba(55,50,47,0.12)] pt-3">
          <div className="px-3 text-xs font-semibold uppercase text-[#827C77]">Chats</div>
          <div className="mt-2 space-y-1">
            {visibleChats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex h-10 w-full items-center gap-2 rounded-lg pl-3 pr-1 text-sm font-medium transition ${
                  chat.id === activeChatId ? "bg-white text-[#37322F]" : "text-[#605A57] hover:bg-white hover:text-[#37322F]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveChatId(chat.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#827C77] opacity-0 transition hover:bg-[#F0EEEC] hover:text-[#9A3D2F] focus:opacity-100 group-hover:opacity-100"
                  aria-label={`Delete ${chat.title}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-3 space-y-1 border-t border-[rgba(55,50,47,0.12)] pt-3 text-[15px] font-medium text-[#605A57]">
          <a href="/setup" className="flex h-11 items-center gap-3 rounded-lg px-3 transition hover:bg-white hover:text-[#37322F]">
            <Compass className="h-5 w-5" aria-hidden />
            Sources
          </a>
          <a href="#" className="flex h-11 items-center gap-3 rounded-lg px-3 transition hover:bg-white hover:text-[#37322F]">
            <Settings className="h-5 w-5" aria-hidden />
            Settings
          </a>
          <a href="/help" className="flex h-11 items-center gap-3 rounded-lg px-3 transition hover:bg-white hover:text-[#37322F]">
            <LifeBuoy className="h-5 w-5" aria-hidden />
            Help
          </a>
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

        {activeChat ? (
          <ChatInterface
            key={activeChat.id}
            chatId={activeChat.id}
            initialQuery={initialQuery}
            initialMessages={activeChat.messages}
            onMessagesChange={updateActiveChat}
          />
        ) : null}
      </section>
    </div>
  );
}
