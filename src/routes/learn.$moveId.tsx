import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { MarkdownView } from "@/components/markdown-view";
import { getMove, moveNeighbors } from "@/lib/content/moves";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/$moveId")({
  component: MovePage,
});

function MovePage() {
  const { moveId } = Route.useParams();
  const move = getMove(moveId);
  const nav = moveNeighbors(moveId);
  const markMove = useProgress((s) => s.markMove);
  const toggleMove = useProgress((s) => s.toggleMove);
  const done = useProgress((s) => Boolean((s.movesDone ?? {})[moveId]));

  useEffect(() => {
    if (move) markMove(move.id);
  }, [move, markMove]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [moveId]);

  if (!move || nav.index < 0) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="font-display text-xl">没有这一招</p>
        <Button asChild className="mt-4">
          <Link to="/learn">回到手法</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={move.priority} />
        <span className="font-mono text-xs tabular-nums text-subtle">{move.section}</span>
        <span className="text-xs tabular-nums text-subtle">
          {nav.index + 1} / {nav.total}
        </span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{move.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{move.bridge}</p>

      <section className="mt-6 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-xs font-medium tracking-wide text-cinnabar">这一招只做一件事</p>
        <p className="mt-2 text-base leading-relaxed">{move.job}</p>
      </section>

      <section className="mt-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-xs font-medium tracking-wide text-cinnabar">为什么这样做是对的</p>
        <MarkdownView markdown={move.why} className="mt-2 text-sm" />
      </section>

      <section className="mt-3 rounded-xl bg-sunken p-4">
        <p className="text-xs font-medium tracking-wide text-pine">先看一个能算完的例子</p>
        <MarkdownView markdown={move.picture} className="mt-2 text-sm" />
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl font-semibold">拿到题，按这个顺序写</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          先盖住灰色的那一行，自己说出为什么要写这一步，再说得通再往下。
        </p>
        <ol className="mt-4 flex flex-col gap-3">
          {move.steps.map((step, i) => (
            <li key={step.write} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sunken font-display text-sm text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <MarkdownView markdown={step.write} className="text-sm" />
                  <div className="mt-2 border-t border-border pt-2">
                    <MarkdownView markdown={step.because} className="text-sm text-muted-foreground" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-wide text-pine">写完自己查</p>
          <MarkdownView markdown={move.check} className="mt-2 text-sm" />
        </section>
        <section className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-wide text-cinnabar">最容易写反</p>
          <MarkdownView markdown={move.trap} className="mt-2 text-sm" />
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
        <p className="text-xs font-medium tracking-wide text-cinnabar">然后做题</p>
        {move.problems.length ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              先自己写。写完再打开详解，对的是步骤，不是先看最后的数。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {move.problems.map((no) => (
                <Button key={no} variant="secondary" asChild>
                  <Link to="/drill" search={{ tab: "exercises", p: no }}>
                    做 {no}
                  </Link>
                </Button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            这一招没有单独的指定题。选择性考，能认出格式、写出基本步骤即可。
          </p>
        )}
        <Button variant="outline" asChild className="mt-3">
          <Link
            to="/read/$chapterId"
            params={{ chapterId: move.chapterId }}
            search={{ s: move.sectionId }}
          >
            对照书上的写法
          </Link>
        </Button>
      </section>

      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => toggleMove(move.id)}
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150",
            done ? "bg-pine text-pine-foreground" : "bg-muted text-foreground hover:bg-sunken",
          )}
        >
          <Check className="size-4" />
          {done ? "这一招会写了" : "标成会写了"}
        </button>
        <div className="flex gap-2">
          {nav.prev ? (
            <Button variant="outline" asChild>
              <Link to="/learn/$moveId" params={{ moveId: nav.prev.id }}>
                <ChevronLeft className="size-4" />
                上一招
              </Link>
            </Button>
          ) : null}
          {nav.next ? (
            <Button asChild>
              <Link to="/learn/$moveId" params={{ moveId: nav.next.id }}>
                下一招
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/learn">全部手法</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
