import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Binary, BookOpen, Check, Library, ListChecks, Route as RouteIcon, Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { MarkdownView } from "@/components/markdown-view";
import {
  CHAPTER_EXERCISES,
  OUT_OF_EXAM,
  STUDY_CHAPTERS,
  allReadableSections,
  chapterNumberLabel,
  chapterPriority,
  shortChapterTitle,
} from "@/lib/content";
import { PLAIN } from "@/lib/content/plain";
import { GUIDES } from "@/lib/content/guides";
import { MOVES } from "@/lib/content/moves";
import { PAPERS } from "@/lib/content/papers";
import { MIXUPS } from "@/lib/content/mixups";
import { PROOFS } from "@/lib/content/proofs";
import { EXERCISES } from "@/lib/content/exercises";
import { sectionKey, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const mastered = useProgress((s) => s.mastered);
  const lastChapterId = useProgress((s) => s.lastChapterId);
  const lastSectionId = useProgress((s) => s.lastSectionId);
  const mixupKnown = useProgress((s) => s.mixupKnown);
  const proofsDone = useProgress((s) => s.proofsDone);
  const exercisesDone = useProgress((s) => s.exercisesDone);

  const sections = allReadableSections();
  const nextFocus =
    sections.find(
      (x) =>
        x.priority === "focus" &&
        x.sectionId !== "intro" &&
        !mastered[sectionKey(x.chapterId, x.sectionId)],
    ) ?? sections.find((x) => x.priority === "focus" && x.sectionId !== "intro");

  const continueTarget = lastChapterId
    ? { chapterId: lastChapterId, sectionId: lastSectionId ?? "intro" }
    : nextFocus
      ? { chapterId: nextFocus.chapterId, sectionId: nextFocus.sectionId }
      : { chapterId: "ch1", sectionId: "intro" };

  const mixDone = MIXUPS.filter((m) => mixupKnown[m.id]).length;
  const proofDone = PROOFS.filter((p) => proofsDone[p.id]).length;
  const exDone = EXERCISES.filter((e) => exercisesDone[e.id]).length;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.16em] text-cinnabar">
          张铁 · 邵新慧 · 科学出版社 2022
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          数值分析考试讲义
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          每一节先从你已经会的地方讲起，再顺着补到考试要写的程度。自己能说出来，再按手法做题。
        </p>
      </header>

      <LearnEntry />
      <ExamEntry />

      <Link
        to="/ai"
        className="mt-8 block rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sunken text-pine">
            <Binary className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.16em] text-pine">新板块</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              AI 视角
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Softmax 为什么不做 max-shift 会炸，Adam 的 ε、混合精度和量化——把考试里的稳定性、条件数、有效数字接到训练和推理上。循序渐进，可动手。
            </p>
            <span className="mt-3 inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary">
              打开 8 节路径
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <RuleCard
          mark="三角"
          title="重点考"
          body="公式、成立条件、手算与证明套路都要能独立完成。"
          tone="focus"
        />
        <RuleCard
          mark="未标"
          title="选择性考"
          body="能识别模型、写出基本算法、判断精度或稳定性。"
          tone="optional"
        />
        <RuleCard
          mark="划叉"
          title="明确不考"
          body="只在“虽不考，但有助于理解”处作背景，不另扩算法。"
          tone="guide"
        />
      </div>

      <div className="mt-6 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-subtle">先听这一节怎么讲</p>
            <p className="mt-1 font-display text-xl font-semibold">
              {lastChapterId ? "回到上次听的那一节" : "从误差这两把尺子听起"}
            </p>
            <MarkdownView
              markdown={
                GUIDES[`${continueTarget.chapterId}:${continueTarget.sectionId}`]?.open ??
                PLAIN[`${continueTarget.chapterId}:${continueTarget.sectionId}`] ??
                "打开讲义，按章节往下听。"
              }
              className="mt-1 line-clamp-3 text-sm text-muted-foreground"
            />
          </div>
          <Button asChild>
            <Link
              to="/read/$chapterId"
              params={{ chapterId: continueTarget.chapterId }}
              search={{ s: continueTarget.sectionId }}
            >
              打开讲义
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">章节目录</h2>
          <p className="text-xs text-subtle">点进后可标记已掌握</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {STUDY_CHAPTERS.map((ch) => {
            const keys = [
              ...(ch.intro.trim() ? ["intro"] : []),
              ...ch.sections.map((s) => s.id),
            ];
            const done = keys.filter((id) => mastered[sectionKey(ch.id, id)]).length;
            const focusN = ch.sections.filter((s) => s.priority === "focus").length;
            const optN = ch.sections.filter((s) => s.priority === "optional").length;
            const pri = chapterPriority(ch);
            const out = OUT_OF_EXAM[ch.id] ?? [];
            return (
              <Link
                key={ch.id}
                to="/read/$chapterId"
                params={{ chapterId: ch.id }}
                className={cn(
                  "group rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
                  pri === "out" && "opacity-80",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sunken font-display text-lg text-primary">
                    {chapterNumberLabel(ch.id)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={cn(
                          "font-display text-base font-semibold leading-snug",
                          pri === "out" && "text-muted-foreground",
                        )}
                      >
                        {shortChapterTitle(ch)}
                      </h3>
                      <PriorityBadge priority={pri} />
                    </div>
                    <MarkdownView
                      markdown={GUIDES[`${ch.id}:intro`]?.open ?? PLAIN[`${ch.id}:intro`] ?? ch.title}
                      className="mt-1 line-clamp-2 text-xs text-muted-foreground"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-subtle">
                      {focusN ? <span>重点 {focusN} 节</span> : null}
                      {optN ? <span>选择性 {optN} 节</span> : null}
                      {CHAPTER_EXERCISES[ch.id] ? (
                        <span>习题 {CHAPTER_EXERCISES[ch.id]}</span>
                      ) : null}
                      <span className="tabular-nums">
                        {done}/{keys.length}
                      </span>
                    </div>
                    {out.length ? (
                      <p className="mt-2 text-[0.6875rem] text-subtle">
                        不考：{out.join("、")}
                      </p>
                    ) : null}
                  </div>
                </div>
                {pri === "out" ? null : (
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-sunken">
                    <div
                      className={cn(
                        "h-full bg-primary transition-[width] duration-300",
                        done === 0 && "bg-border",
                      )}
                      style={{ width: `${keys.length ? (100 * done) / keys.length : 0}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ToolCard
          to="/ai"
          icon={Binary}
          title="AI 视角"
          detail="8 节路径 · 稳定性 / 条件数 / 量化"
        />
        <ToolCard
          to="/formulas"
          icon={Sigma}
          title="公式速查"
          detail="按章节收录考试常用公式与成立条件"
        />
        <ToolCard
          to="/drill"
          icon={ListChecks}
          title="易混对照"
          detail={`${mixDone}/${MIXUPS.length} 条已过 · ${proofDone}/${PROOFS.length} 条证明`}
        />
        <ToolCard
          to="/drill"
          search={{ tab: "exercises" }}
          icon={BookOpen}
          title="指定习题"
          detail={`${exDone}/${EXERCISES.length} 章已勾 · 46 题可展开详解`}
        />
      </section>
    </div>
  );
}

function LearnEntry() {
  const movesDone = useProgress((s) => s.movesDone) ?? {};
  const lastMoveId = useProgress((s) => s.lastMoveId);
  const done = MOVES.filter((m) => movesDone[m.id]).length;
  const move =
    (lastMoveId ? MOVES.find((m) => m.id === lastMoveId) : undefined) ??
    MOVES.find((m) => !movesDone[m.id]) ??
    MOVES[0];

  return (
    <Link
      to="/learn/$moveId"
      params={{ moveId: move.id }}
      className="mt-8 block rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sunken text-cinnabar">
          <RouteIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.16em] text-cinnabar">先走这里</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {lastMoveId ? "继续上一招" : "从误差这一招开始"}
          </h2>
          <p className="mt-2 text-sm text-foreground">{move.section} {move.title}</p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{move.job}</p>
          <span className="mt-3 inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary">
            {done > 0 ? `已会 ${done} / ${MOVES.length} 招` : `${MOVES.length} 招，一屏只讲一件事`}
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ExamEntry() {
  const examsDone = useProgress((s) => s.examsDone) ?? {};
  const done = PAPERS.filter((p) => examsDone[p.id]).length;
  return (
    <Link
      to="/exams"
      className="mt-3 block rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-sunken text-primary">
          <Library className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.16em] text-primary">真题</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">11 套期末卷</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            2015 到 2026，按章排好。先做题，再打开详解。
          </p>
          <span className="mt-3 inline-flex h-10 items-center gap-1.5 text-sm font-medium text-primary">
            {done > 0 ? `做过 ${done} / ${PAPERS.length}` : `${PAPERS.length} 题`}
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function RuleCard({
  mark,
  title,
  body,
  tone,
}: {
  mark: string;
  title: string;
  body: string;
  tone: "focus" | "optional" | "guide";
}) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
      <p
        className={cn(
          "text-[0.6875rem] font-medium tracking-wide",
          tone === "focus" && "text-cinnabar",
          tone === "optional" && "text-pine",
          tone === "guide" && "text-subtle",
        )}
      >
        {mark}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function ToolCard({
  to,
  search,
  icon: Icon,
  title,
  detail,
}: {
  to: "/formulas" | "/drill" | "/ai";
  search?: { tab: string };
  icon: typeof Sigma;
  title: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-sunken text-primary">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="flex items-center gap-1.5 font-medium">
          {title}
          {title.includes("已过") ? <Check className="size-3.5" /> : null}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
      </span>
    </Link>
  );
}
