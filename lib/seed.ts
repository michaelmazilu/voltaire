import flights from "../data/flight_fallbacks.json";
import instagramMessages from "../data/instagram_messages.json";
import meetingNotes from "../data/meeting_notes.json";
import type { FlightResult, MemoryItem } from "./types";

type InstagramSeed = {
  id: string;
  platform: "instagram";
  conversation_id: string;
  sender: string;
  recipient: string;
  timestamp: string;
  text: string;
};

type MeetingSeed = {
  id: string;
  platform: "google_meet";
  meeting_title: string;
  participants: string[];
  speaker: string;
  timestamp: string;
  text: string;
};

export const USER_ID = "demo_user";
export const DEMO_USER_NAME = "Alex Rivera";

export function isDemoMode() {
  return process.env.VOLTAIRE_DATA_MODE !== "production";
}

export function instagramMemoryItems(): MemoryItem[] {
  return (instagramMessages as InstagramSeed[]).map((message) => ({
    id: message.id,
    userId: USER_ID,
    source: "instagram",
    sourceType: "message",
    title: `Instagram DM with ${message.recipient}`,
    text: message.text,
    author: message.sender,
    participants: [message.sender, message.recipient],
    timestamp: message.timestamp,
    metadata: message,
  }));
}

export function meetingMemoryItems(): MemoryItem[] {
  return (meetingNotes as MeetingSeed[]).map((note) => ({
    id: note.id,
    userId: USER_ID,
    source: "google_meet",
    sourceType: "meeting_note",
    title: note.meeting_title,
    text: note.text,
    author: note.speaker,
    participants: note.participants,
    timestamp: note.timestamp,
    metadata: note,
  }));
}

export function flightResults(): FlightResult[] {
  return flights as FlightResult[];
}

export function allMemoryItems(): MemoryItem[] {
  return [...instagramMemoryItems(), ...meetingMemoryItems()];
}

export function seedCounts() {
  const messages = instagramMemoryItems();
  const meetings = meetingMemoryItems();
  const flightCount = flightResults().length;
  return {
    memoryItems: messages.length + meetings.length,
    people: 5,
    messages: messages.length,
    meetings: meetings.length,
    tasks: 3,
    flights: flightCount,
    graphNodes: 19,
    graphRelationships: 22,
  };
}
