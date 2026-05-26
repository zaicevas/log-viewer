import { Suspense } from "react";
import { LogsData } from "@/features/logs/components/logs-data";
import { LogsSkeleton } from "@/features/logs/components/logs-skeleton";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="flex-1">
      <div className="w-full px-6 py-8">
        <Suspense fallback={<LogsSkeleton />}>
          <LogsData />
        </Suspense>
      </div>
    </main>
  );
}
