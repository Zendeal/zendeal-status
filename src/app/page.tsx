import { StatusBoard } from "@/components/status-board";
import { runChecks } from "@/lib/checks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initial = await runChecks();

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <StatusBoard initial={initial} />
    </main>
  );
}
