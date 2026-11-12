import { Link } from "@tanstack/react-router";
import { TeX } from "@/components/tex";
import { MarkdownView } from "@/components/markdown-view";
import { PriorityBadge } from "@/components/priority-badge";
import { FORMULAS } from "@/lib/content/formulas";
import { WORKED } from "@/lib/content/worked";

export function ChapterKit({
  chapterId,
  sectionId,
}: {
  chapterId: string;
  sectionId: string;
}) {
  const onIntro = sectionId === "intro";
  const formulas = FORMULAS.filter(
    (f) => f.chapterId === chapterId && (onIntro || f.section === sectionId),
  );
  const examples = WORKED.filter(
    (w) => w.chapterId === chapterId && (onIntro || w.sectionId === sectionId),
  );
  if (formulas.length === 0 && examples.length === 0) return null;

  return (
    <section className="mt-8 border-t border-border pt-6">
      {formulas.length > 0 ? (
        <div>
          <h2 className="font-display text-xl font-semibold">
            {onIntro ? "本章公式" : "本节公式"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {onIntro
              ? "这一章要带进考场的式子都在这里。先看成立条件，再往下做例题。"
              : "这一节用到的式子。成立条件和章首那一套相同。"}
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {formulas.map((f) => (
              <article
                key={f.id}
                className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={f.priority} />
                  <h3 className="font-display text-base font-semibold">{f.title}</h3>
                  <span className="text-xs text-subtle">{f.section}</span>
                </div>
                <div className="mt-2">
                  <TeX latex={f.latex} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{f.note}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {examples.length > 0 ? (
        <div className={formulas.length > 0 ? "mt-8" : undefined}>
          <h2 className="font-display text-xl font-semibold">完整例题</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            从题干算到答案。中间不跳步，最后一行可以拿来对。
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {examples.map((ex) => (
              <article
                key={ex.id}
                id={`worked-${ex.id}`}
                className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5"
              >
                <h3 className="font-display text-lg font-semibold">{ex.title}</h3>
                <MarkdownView markdown={ex.prompt} className="lecture-tight mt-3" />
                <ol className="mt-4 flex flex-col gap-4">
                  {ex.steps.map((step, i) => (
                    <li key={i} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2">
                      <span className="pt-0.5 font-display text-sm tabular-nums text-cinnabar">
                        {i + 1}
                      </span>
                      <MarkdownView markdown={step} className="lecture-tight" />
                    </li>
                  ))}
                </ol>
                <div className="mt-4 rounded-lg bg-sunken px-4 py-3">
                  <p className="text-xs font-medium tracking-wide text-pine">答案</p>
                  <MarkdownView markdown={ex.answer} className="lecture-tight mt-1" />
                </div>
                {!onIntro ? null : (
                  <Link
                    to="/read/$chapterId"
                    params={{ chapterId }}
                    search={{ s: ex.sectionId }}
                    className="mt-3 inline-flex h-10 items-center text-sm text-primary"
                  >
                    回到这一题所在的那一节
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
