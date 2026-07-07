type ButterbaseConfig = {
  appId: string;
  apiUrl: string;
  anonKey: string;
};

export function createClient(config: ButterbaseConfig) {
  return {
    config,
    isConfigured: Boolean(config.appId && config.apiUrl && config.anonKey),
  };
}

export function getButterbaseClient() {
  return createClient({
    appId: process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID ?? "",
    apiUrl: process.env.NEXT_PUBLIC_BUTTERBASE_API_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_BUTTERBASE_ANON_KEY ?? "",
  });
}

export function hasButterbaseAdminKey() {
  return Boolean(process.env.BUTTERBASE_SECRET_KEY);
}

export async function callMcpTool(name: string, args: any) {
  const secretKey = process.env.BUTTERBASE_SECRET_KEY;
  if (!secretKey) throw new Error("BUTTERBASE_SECRET_KEY is not configured");

  const response = await fetch("https://api.butterbase.ai/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Authorization": `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "mcp_" + Math.random().toString(36).slice(2),
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP tool call to ${name} failed: ${response.status} ${await response.text()}`);
  }

  const text = await response.text();
  const dataLine = text.split("\n").find((line) => line.startsWith("data: "));
  if (!dataLine) {
    throw new Error(`Invalid MCP response: no data event found. Response was: ${text}`);
  }

  const json = JSON.parse(dataLine.slice(6));
  if (json.error) {
    throw new Error(`MCP tool ${name} returned error: ${json.error.message}`);
  }

  return JSON.parse(json.result.content[0].text);
}

export async function insertButterbaseRows(table: string, rows: Record<string, unknown>[]) {
  const appId = process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID;
  if (!appId || !hasButterbaseAdminKey() || !rows.length) {
    return { inserted: 0, configured: Boolean(appId && hasButterbaseAdminKey()) };
  }

  await callMcpTool("insert_rows", { app_id: appId, table, rows });
  return { inserted: rows.length, configured: true };
}
