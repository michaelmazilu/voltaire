"use client";

import { CalendarIcon, Instagram, Loader2 } from "lucide-react";
import { useState } from "react";

type IntegrationKey = "instagram" | "google-meet";

type ConnectState = {
  status: "idle" | "loading" | "ready" | "error";
  message?: string;
};

const integrations = [
  {
    key: "instagram" as const,
    title: "Instagram",
    copy: "Use Instagram's official data export and import message JSON files.",
    action: "Connect Instagram",
    Icon: Instagram,
  },
  {
    key: "google-meet" as const,
    title: "Google Meet",
    copy: "Prepare Google Calendar access so Meet events and notes can be ingested later.",
    action: "Connect Google Meet",
    Icon: CalendarIcon,
  },
];

export function IntegrationConnectPanel() {
  const [states, setStates] = useState<Record<IntegrationKey, ConnectState>>({
    instagram: { status: "idle" },
    "google-meet": { status: "idle" },
  });

  async function connect(key: IntegrationKey) {
    setStates((current) => ({ ...current, [key]: { status: "loading" } }));

    try {
      const response = await fetch(`/api/connect/${key}`, { method: "POST" });
      const payload = (await response.json()) as { authUrl?: string; message?: string; error?: string };

      if (payload.authUrl) {
        window.location.href = payload.authUrl;
        return;
      }

      setStates((current) => ({
        ...current,
        [key]: {
          status: response.ok ? "ready" : "error",
          message: payload.message ?? payload.error ?? "Connection flow is not configured yet.",
        },
      }));
    } catch {
      setStates((current) => ({
        ...current,
        [key]: { status: "error", message: "Could not start the connection flow." },
      }));
    }
  }

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {integrations.map(({ key, title, copy, action, Icon }) => {
        const state = states[key];

        return (
          <section key={key} className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#37322F]">{title}</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#605A57]">{copy}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#F7F5F3] text-[#37322F]">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </div>

            <button
              type="button"
              onClick={() => connect(key)}
              disabled={state.status === "loading"}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[#37322F] px-4 text-sm font-semibold text-white transition hover:bg-[#2A2520] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {action}
            </button>

            {state.message ? (
              <p className={`mt-3 text-xs font-medium leading-5 ${state.status === "error" ? "text-[#9A3D2F]" : "text-[#827C77]"}`}>
                {state.message}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
