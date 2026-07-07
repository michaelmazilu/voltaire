export type Source =
  | "instagram"
  | "google_meet"
  | "exa"
  | "manual"
  | "fallback";

export type SourceType =
  | "message"
  | "meeting_note"
  | "web_result"
  | "flight_result"
  | "task";

export type Entity = {
  id: string;
  type:
    | "person"
    | "meeting"
    | "message"
    | "task"
    | "web_result"
    | "flight"
    | "source"
    | "topic";
  name: string;
  aliases?: string[];
  metadata?: Record<string, unknown>;
};

export type Relationship = {
  from: string;
  to: string;
  type:
    | "SENT_MESSAGE_TO"
    | "AUTHORED"
    | "MENTIONS"
    | "FROM_SOURCE"
    | "PARTICIPATED_IN"
    | "SAID_IN_MEETING"
    | "IS_BOSS_OF"
    | "CONTAINS_ACTION_ITEM"
    | "SEARCH_RESULT_FOR"
    | "FOUND_IN"
    | "INTERACTED_WITH";
  metadata?: Record<string, unknown>;
};

export type MemoryItem = {
  id: string;
  userId: string;
  source: Source;
  sourceType: SourceType;
  title?: string;
  text: string;
  author?: string;
  participants?: string[];
  timestamp?: string;
  url?: string;
  metadata: Record<string, unknown>;
  entities?: Entity[];
  relationships?: Relationship[];
};

export type QueryIntent =
  | "conversation"
  | "flight_search"
  | "personal_memory_search"
  | "work_memory_search"
  | "web_search"
  | "cross_source_search";

export type RouteResult = {
  intent: QueryIntent;
  sources: string[];
  methods: string[];
};

export type EvidenceCard = {
  id: string;
  source: Source;
  sourceType: SourceType;
  title: string;
  text: string;
  timestamp?: string;
  person?: string;
  url?: string;
  metadata: Record<string, unknown>;
};

export type FlightResult = {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  date: string;
  price: number;
  departure_time: string;
  arrival_time: string;
  layovers: number;
  url: string;
};

export type GraphTraceItem = {
  from: string;
  type: Relationship["type"];
  to: string;
};

export type SearchResponse = {
  query: string;
  intent: QueryIntent;
  answer: string;
  evidenceCards: EvidenceCard[];
  flights?: FlightResult[];
  graphTrace: GraphTraceItem[];
  loadingTrace: string[];
  sourcesSearched: string[];
};
