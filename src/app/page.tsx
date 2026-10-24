import { StatusBoard } from "@/components/status-board";
import { runChecks } from "@/lib/checks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initial = await runChecks();

  return (
    <main className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgb(52 211 153 / 12%), transparent 55%), linear-gradient(180deg, #0a0a0c 0%, #0c0f0e 50%, #0a0a0c 100%)",
        }}
      />
      <StatusBoard initial={initial} />
    </main>
  );
}
