import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { getChapter, shortChapterTitle } from "@/lib/content";
import { MOVES } from "@/lib/content/moves";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/")({ component: LearnHub });

function LearnHub() {
  const movesDone = useProgress((s) => s.movesDone) ?? {};
  const lastMoveId = useProgress((s) => s.lastMoveId);
  const done = MOVES.filter((m) => movesDone[m.id]).length;
  const continueMove =
    (lastMoveId ? MOVES.find((m) => m.id === lastMoveId) : undefined) ??
    MOVES.find((m) => !movesDone[m.id]) ??
    MOVES[0];

  const groups: { chapterId: string; ids: number[] }[] = [];
  MOVES.forEach((m, i) => {
    const last = groups[groups.length - 1];
    if (!last || last.chapterId !== m.chapterId) groups.push({ chapterId: m.chapterId, ids: [i] });
    else last.ids.push(i);
  });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-medium tracking-[0.16em] text-cinnabar">手法</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        先懂这一步为什么，再动手写
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground">
        每屏只学一招：这一招在干什么，为什么这样做是对的，拿到题按什么顺序写。写的时候先盖住灰色的「因为」，自己说得出来再对照。书上的公式在讲义里，用来核对，不当成第一遍。
      </p>

      <div className="mt-6 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <p className="text-xs text-subtle">{lastMoveId ? "接着上一招" : "从误差开始"}</p>
        <p className="mt-1 font-display text-xl font-semibold">
          {continueMove.section} {continueMove.title}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{continueMove.job}</p>
        <Button asChild className="mt-4">
          <Link to="/learn/$moveId" params={{ moveId: continueMove.id }}>
            {lastMoveId ? "继续这一招" : "从第一招开始"}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-subtle">
        <span>
          会写了 {done} / {MOVES.length}
        </span>
        <span>重点先走完，选择性放在各章末尾</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-sunken">
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${(100 * done) / MOVES.length}%` }}
        />
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {groups.map((g) => {
          const ch = getChapter(g.chapterId);
          return (
            <section key={g.chapterId}>
              <h2 className="font-display text-lg font-semibold">
                {ch ? shortChapterTitle(ch) : g.chapterId}
              </h2>
              <ol className="mt-3 flex flex-col gap-2">
                {g.ids.map((i) => {
                  const m = MOVES[i];
                  const known = Boolean(movesDone[m.id]);
                  return (
                    <li key={m.id}>
                      <Link
                        to="/learn/$moveId"
                        params={{ moveId: m.id }}
                        className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                      >
                        <span
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-md bg-sunken font-display text-sm",
                            known ? "text-pine" : "text-primary",
                          )}
                        >
                          {known ? <Check className="size-4" /> : i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs tabular-nums text-subtle">{m.section}</span>
                            <span className="font-display text-base font-semibold leading-snug">{m.title}</span>
                            {m.priority === "optional" ? <PriorityBadge priority="optional" /> : null}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">{m.job}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
