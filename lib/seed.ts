import type { FlightResult, MemoryItem } from "./types";

export const USER_ID = "michael";

export function instagramMemoryItems(): MemoryItem[] {
  return [];
}

export function meetingMemoryItems(): MemoryItem[] {
  return [];
}

export function flightResults(): FlightResult[] {
  return [];
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
    people: 0,
    messages: messages.length,
    meetings: meetings.length,
    tasks: 0,
    flights: flightCount,
    graphNodes: 0,
    graphRelationships: 0,
  };
}
