import { fetchLogs } from "@/features/logs/api/fetch-logs";
import { LogsView } from "@/features/logs/components/logs-view";

export async function LogsData() {
  const { logs } = await fetchLogs();
  return <LogsView logs={logs} />;
}
