import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MIXUPS } from "@/lib/content/mixups";
import { PROOFS } from "@/lib/content/proofs";
import { EXERCISE_NOTES, EXERCISES } from "@/lib/content/exercises";
import { SOLUTION_NOTES, SOLUTIONS } from "@/lib/content/solutions";
import { moveForProblem } from "@/lib/content/moves";
import { getChapter, shortChapterTitle } from "@/lib/content";
import { useProgress } from "@/lib/progress";
import { MarkdownView } from "@/components/markdown-view";
import { cn } from "@/lib/utils";

type Tab = "mixups" | "proofs" | "exercises";

export const Route = createFileRoute("/drill")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab; p?: string } => {
    const t = s.tab;
    const tab = t === "mixups" || t === "proofs" || t === "exercises" ? t : undefined;
    const p = typeof s.p === "string" && /^\d+-\d+$/.test(s.p) ? s.p : undefined;
    return { tab, p };
  },
  component: DrillPage,
});

function DrillPage() {
  const search = Route.useSearch();
  const tab: Tab = search.tab ?? (search.p ? "exercises" : "mixups");
  const reset = useProgress((s) => s.reset);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-cinnabar">自测</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            易混 · 证明 · 习题
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            判断题常从易混表出。证明先能默写步骤。指定题先按手法写，写完再展开详解。
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm("清除本地阅读与勾选进度？")) reset();
          }}
        >
          <RotateCcw className="size-4" />
          重置
        </Button>
      </div>

      <div className="sticky top-14 z-10 mt-6 flex gap-1 rounded-lg bg-muted p-1">
        <TabLink id="mixups" current={tab} label="易混对照" />
        <TabLink id="proofs" current={tab} label="证明清单" />
        <TabLink id="exercises" current={tab} label="指定习题" />
      </div>

      <div className="mt-6">
        {tab === "mixups" ? <MixupList /> : null}
        {tab === "proofs" ? <ProofList /> : null}
        {tab === "exercises" ? <ExerciseList focusNo={search.p} /> : null}
      </div>
    </div>
  );
}

function TabLink({ id, current, label }: { id: Tab; current: Tab; label: string }) {
  return (
    <Link
      to="/drill"
      search={{ tab: id }}
      className={cn(
        "flex h-10 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors duration-150",
        current === id ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function MixupList() {
  const known = useProgress((s) => s.mixupKnown);
  const toggle = useProgress((s) => s.toggleMixup);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const done = MIXUPS.filter((m) => known[m.id]).length;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        先看左边的错法，点开看正确区分。已会的可以勾掉。
        <span className="ml-2 tabular-nums text-foreground">
          {done}/{MIXUPS.length}
        </span>
      </p>
      <div className="flex flex-col gap-3">
        {MIXUPS.map((m, i) => {
          const ch = getChapter(m.chapterId);
          const shown = open[m.id];
          return (
            <article
              key={m.id}
              className={cn(
                "rounded-xl bg-card p-4 shadow-[var(--shadow-border)]",
                known[m.id] && "opacity-70",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="w-6 shrink-0 font-display text-sm tabular-nums text-subtle">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.6875rem] text-subtle">
                    {ch ? shortChapterTitle(ch) : m.chapterId}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="text-cinnabar">错：</span>
                    {m.wrong}
                  </p>
                  {shown ? (
                    <p className="mt-2 text-sm">
                      <span className="text-pine">对：</span>
                      {m.right}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOpen((s) => ({ ...s, [m.id]: !s[m.id] }))}
                    >
                      {shown ? "收起" : "看正确说法"}
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-150",
                          shown && "rotate-180",
                        )}
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant={known[m.id] ? "default" : "secondary"}
                      onClick={() => toggle(m.id)}
                    >
                      <Check className="size-4" />
                      {known[m.id] ? "已会" : "标为已会"}
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ProofList() {
  const doneMap = useProgress((s) => s.proofsDone);
  const toggle = useProgress((s) => s.toggleProof);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const done = PROOFS.filter((p) => doneMap[p.id]).length;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        闭卷前应能不翻书重建这些推导。优先三角部分。
        <span className="ml-2 tabular-nums text-foreground">
          {done}/{PROOFS.length}
        </span>
      </p>
      <div className="flex flex-col gap-3">
        {PROOFS.map((p, i) => {
          const shown = open[p.id];
          return (
            <article key={p.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <div className="flex items-start gap-3">
                <span className="w-6 shrink-0 font-display text-sm tabular-nums text-subtle">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold">{p.title}</h2>
                  {shown ? (
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                      {p.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {p.steps.length} 步 · 先自己默写，再对照
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setOpen((s) => ({ ...s, [p.id]: !s[p.id] }))}
                    >
                      {shown ? "收起步骤" : "看步骤"}
                    </Button>
                    <Button
                      size="sm"
                      variant={doneMap[p.id] ? "default" : "secondary"}
                      onClick={() => toggle(p.id)}
                    >
                      <Check className="size-4" />
                      {doneMap[p.id] ? "已能默写" : "标为已能默写"}
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/read/$chapterId" params={{ chapterId: p.chapterId }}>
                        打开章节
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseList({ focusNo }: { focusNo?: string }) {
  const doneMap = useProgress((s) => s.exercisesDone);
  const toggle = useProgress((s) => s.toggleExercise);
  const done = EXERCISES.filter((e) => doneMap[e.id]).length;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (!focusNo) return;
    document.getElementById(`problem-${focusNo}`)?.scrollIntoView({ block: "center" });
  }, [focusNo]);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{EXERCISE_NOTES}</p>
      <div className="mb-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowNotes((v) => !v)}
        >
          {showNotes ? "收起核算差异" : "和书后简答对不上的地方"}
        </Button>
        {showNotes ? (
          <MarkdownView markdown={SOLUTION_NOTES} className="mt-3 text-sm" />
        ) : null}
      </div>
      <p className="mb-4 text-sm tabular-nums">
        已勾 {done}/{EXERCISES.length} 章
      </p>
      <div className="flex flex-col gap-3">
        {EXERCISES.map((e) => (
          <article key={e.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">{e.chapter}</h2>
                <p className="mt-1 font-mono text-sm tabular-nums text-primary">题 {e.numbers}</p>
                <p className="mt-2 text-sm text-muted-foreground">{e.goal}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(e.id)}
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-md border transition-colors duration-150",
                  doneMap[e.id]
                    ? "border-pine bg-pine text-pine-foreground"
                    : "border-border bg-card text-subtle",
                )}
                aria-label={doneMap[e.id] ? "取消完成" : "标记完成"}
              >
                <Check className="size-5" />
              </button>
            </div>
            <ol className="mt-4 flex flex-col gap-3">
              {e.problems.map((p) => {
                const sol = SOLUTIONS[p.no];
                const shown = Boolean(open[p.no]);
                const move = moveForProblem(p.no);
                return (
                  <li
                    key={p.no}
                    id={`problem-${p.no}`}
                    className={cn(
                      "scroll-mt-24 rounded-lg bg-sunken px-3 py-3",
                      focusNo === p.no && "bg-card shadow-[var(--shadow-border)]",
                    )}
                  >
                    <p className="font-mono text-xs tabular-nums text-cinnabar">{p.no}</p>
                    {move ? (
                      <Link
                        to="/learn/$moveId"
                        params={{ moveId: move.id }}
                        className="mt-1 inline-flex min-h-10 items-center text-sm text-primary"
                      >
                        还写不出时，先看这一招：{move.title}
                      </Link>
                    ) : null}
                    <MarkdownView markdown={p.markdown} className="mt-1 text-sm" />
                    {sol ? (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setOpen((s) => ({ ...s, [p.no]: !s[p.no] }))
                          }
                        >
                          {shown ? "收起详解" : "看详解"}
                        </Button>
                        {shown ? (
                          <MarkdownView markdown={sol} className="mt-3 text-sm" />
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <Link
              to="/read/$chapterId"
              params={{ chapterId: e.chapterId }}
              className="mt-3 inline-flex h-10 items-center text-sm text-primary"
            >
              打开对应讲义
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
