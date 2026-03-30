import { Bot, UserRound } from "lucide-react";

export default function AIAgentChat() {
  return (
    <section className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-[0_4px_16px_rgba(10,20,19,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <Bot size={16} className="text-[#0A1413]/80" />
        <h2 className="text-xl font-bold [font-family:Domine,serif]">Operational Activity</h2>
      </div>

      <div className="space-y-3">
        <article className="rounded-xl border border-[#E8EFEC] bg-[#FAFCFB] p-3">
          <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5C746F]">
            <UserRound size={12} />
            Executive Query
          </p>
          <p className="text-sm text-[#1F3732]">Analyze route efficiency for the Texas corridor.</p>
        </article>

        <article className="rounded-xl border border-[#00D180]/20 bg-[#F3FCF8] p-3">
          <p className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#117D55]">
            <Bot size={12} />
            AI Response
          </p>
          <p className="text-sm text-[#1F3732]">
            Scanning 6 connected systems... Data from Geotab (Fleet) and Legacy ERP (Accounting)
            identifies a 12% fuel inefficiency on the Houston-San Antonio leg. Suggestion: Re-route
            3 units via I-10 to bypass construction.
          </p>
        </article>
      </div>
    </section>
  );
}
