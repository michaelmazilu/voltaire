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
