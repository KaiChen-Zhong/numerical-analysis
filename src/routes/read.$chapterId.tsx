import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { MarkdownView } from "@/components/markdown-view";
import {
  CHAPTER_EXERCISES,
  OUT_OF_EXAM,
  STUDY_CHAPTERS,
  chapterPriority,
  getChapter,
  getSection,
  neighbors,
  shortChapterTitle,
} from "@/lib/content";
import { PLAIN } from "@/lib/content/plain";
import { getGuide } from "@/lib/content/guides";
import { moveForSection } from "@/lib/content/moves";
import { ChapterKit } from "@/components/chapter-kit";
import { sectionKey, useProgress } from "@/lib/progress";
import type { Priority } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type Search = { s?: string };

export const Route = createFileRoute("/read/$chapterId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    s: typeof s.s === "string" ? s.s : undefined,
  }),
  component: Reader,
});

function Reader() {
  const { chapterId } = Route.useParams();
  const { s } = Route.useSearch();
  const navigate = useNavigate();
  const chapter = getChapter(chapterId);
  const [tocOpen, setTocOpen] = useState(false);

  const sectionId = useMemo(() => {
    if (!chapter) return "intro";
    if (s && (s === "intro" || chapter.sections.some((x) => x.id === s))) return s;
    if (chapter.intro.trim()) return "intro";
    return chapter.sections[0]?.id ?? "intro";
  }, [chapter, s]);

  const pack = getSection(chapterId, sectionId);
  const nav = neighbors(chapterId, sectionId);
  const markSeen = useProgress((s) => s.markSeen);
  const toggleMastered = useProgress((s) => s.toggleMastered);
  const mastered = useProgress((s) => s.mastered);
  const isMastered = Boolean(mastered[sectionKey(chapterId, sectionId)]);
  const plain = PLAIN[`${chapterId}:${sectionId}`];
  const guide = getGuide(chapterId, sectionId);
  const move = moveForSection(chapterId, sectionId);
  const [bookOpen, setBookOpen] = useState(false);
  const [heard, setHeard] = useState(false);
  const bookIsMap =
    sectionId === "intro" ||
    sectionId === "scope" ||
    sectionId === "howto" ||
    sectionId === "ch6-check" ||
    sectionId === "ch78-ex";

  useEffect(() => {
    if (chapter) markSeen(chapterId, sectionId);
  }, [chapter, chapterId, sectionId, markSeen]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setBookOpen(false);
    setHeard(false);
  }, [chapterId, sectionId]);

  if (!chapter || !pack) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="font-display text-xl">没有这一章</p>
        <Button asChild className="mt-4">
          <Link to="/">回到首页</Link>
        </Button>
      </div>
    );
  }

  const priority: Priority = pack.section?.priority ?? chapterPriority(chapter);

  function go(ch: string, sec: string) {
    void navigate({
      to: "/read/$chapterId",
      params: { chapterId: ch },
      search: { s: sec },
    });
    setTocOpen(false);
  }

  return (
    <div className="mx-auto flex min-w-0 max-w-5xl gap-8">
      <nav className="sticky top-20 hidden h-[calc(100dvh-7rem)] w-56 shrink-0 overflow-y-auto xl:block">
        <Toc
          currentChapter={chapterId}
          currentSection={sectionId}
          onPick={go}
        />
      </nav>

      <article className="min-w-0 max-w-full flex-1">
        <div className="mb-5 flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted xl:hidden"
            onClick={() => setTocOpen(true)}
          >
            <List className="size-4" />
            目录
          </button>
          <PriorityBadge priority={priority} />
          <span className="text-xs text-subtle">
            {nav.index >= 0 ? `${nav.index + 1} / ${nav.total}` : null}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{chapter.title}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {pack.section ? pack.title : shortChapterTitle(chapter)}
        </h1>

        {guide ? (
          <div className="mt-6">
            <p className="text-xs font-medium tracking-wide text-cinnabar">先建立感觉</p>
            <MarkdownView markdown={guide.open} className="mt-3" />
            <BeatList items={guide.beats} tone="plain" />
            {guide.deep && guide.deep.length > 0 ? (
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-medium tracking-wide text-primary">
                  再讲到能做题
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  题干和这一题的演算在上面。下面是同一套式子的一般写法，以及考试会卡的条件。
                </p>
                <BeatList items={guide.deep} tone="deep" />
              </div>
            ) : null}
            <div className="mt-8 rounded-xl bg-sunken p-4">
              <p className="text-xs font-medium tracking-wide text-pine">先停一下</p>
              <MarkdownView markdown={guide.pause} className="mt-2" />
              {heard ? (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground">
                    对上了吗
                  </p>
                  <MarkdownView markdown={guide.land} className="mt-2" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setHeard(true)}
                  className="mt-3 flex h-11 items-center text-sm font-medium text-primary"
                >
                  我想过了，看一句
                </button>
              )}
            </div>
            {move ? (
              <Link
                to="/learn/$moveId"
                params={{ moveId: move.id }}
                className="mt-3 inline-flex h-11 items-center text-sm text-primary"
              >
                这一节听懂了，做题按手法写
              </Link>
            ) : null}
          </div>
        ) : plain ? (
          <div className="mt-5 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="text-[0.6875rem] font-medium tracking-wide text-cinnabar">人话版</p>
            <p className="mt-1.5 text-sm leading-relaxed">{plain}</p>
          </div>
        ) : null}

        {sectionId === "intro" && OUT_OF_EXAM[chapterId] ? (
          <p className="mt-4 text-xs text-subtle">
            {chapterPriority(chapter) === "out"
              ? "本章整章不考，仅作背景阅读。"
              : `本章划叉不考：${OUT_OF_EXAM[chapterId].join("、")}`}
            {CHAPTER_EXERCISES[chapterId]
              ? ` · 指定习题 ${CHAPTER_EXERCISES[chapterId]}`
              : ""}
          </p>
        ) : null}

        <ChapterKit chapterId={chapterId} sectionId={sectionId} />

        <div className="mt-6">
          {guide && !bookIsMap ? (
            <button
              type="button"
              onClick={() => setBookOpen((v) => !v)}
              className="mb-4 flex h-11 items-center text-sm text-primary"
            >
              {bookOpen ? "收起书上的写法" : "需要核对编号时，再展开书上的写法"}
            </button>
          ) : null}
          {guide && bookIsMap ? (
            <p className="mb-4 text-sm text-muted-foreground">
              上面先讲怎么理解，再补到考试要写的程度。下面的表只用来核对范围和题号。
            </p>
          ) : null}
          {!guide || bookIsMap || bookOpen ? (
            <MarkdownView markdown={pack.markdown || "_（本章无独立章首说明）_"} />
          ) : (
            <p className="text-sm text-muted-foreground">
              第一遍先把上面两截听完：先是感觉，再是考试要写的程度。自己把那一句说出来。定理编号和例题按书收在这里，核对时再展开。
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => toggleMastered(chapterId, sectionId)}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150",
              isMastered
                ? "bg-pine text-pine-foreground"
                : "bg-muted text-foreground hover:bg-sunken",
            )}
          >
            <Check className="size-4" />
            {isMastered ? "已掌握" : "标为已掌握"}
          </button>
          <div className="flex gap-2">
            {nav.prev ? (
              <Button variant="outline" asChild>
                <Link
                  to="/read/$chapterId"
                  params={{ chapterId: nav.prev.chapterId }}
                  search={{ s: nav.prev.sectionId }}
                >
                  <ChevronLeft className="size-4" />
                  上一节
                </Link>
              </Button>
            ) : null}
            {nav.next ? (
              <Button asChild>
                <Link
                  to="/read/$chapterId"
                  params={{ chapterId: nav.next.chapterId }}
                  search={{ s: nav.next.sectionId }}
                >
                  下一节
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </article>

      {tocOpen ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-overlay"
            aria-label="关闭目录"
            onClick={() => setTocOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-card p-4 pb-24 shadow-[var(--shadow-border-hover)]">
            <p className="mb-3 font-display text-lg font-semibold">目录</p>
            <Toc currentChapter={chapterId} currentSection={sectionId} onPick={go} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function BeatList({ items, tone }: { items: string[]; tone: "plain" | "deep" }) {
  return (
    <ol className={tone === "plain" ? "mt-8" : "mt-6"}>
      {items.map((beat, i) => (
        <li key={i} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "mt-2 size-2 shrink-0 rounded-full",
                tone === "deep" ? "bg-cinnabar" : "bg-primary",
              )}
            />
            {i < items.length - 1 ? <span className="my-1 w-px flex-1 bg-border" /> : null}
          </div>
          <div className={cn(i < items.length - 1 && "pb-6")}>
            <MarkdownView markdown={beat} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Toc({
  currentChapter,
  currentSection,
  onPick,
}: {
  currentChapter: string;
  currentSection: string;
  onPick: (ch: string, sec: string) => void;
}) {
  const mastered = useProgress((s) => s.mastered);
  useEffect(() => {
    document
      .querySelector("[data-active='true']")
      ?.scrollIntoView({ block: "nearest" });
  }, [currentChapter, currentSection]);
  return (
    <div className="flex flex-col gap-4">
      {STUDY_CHAPTERS.map((ch) => (
        <div key={ch.id}>
          <p className="mb-1 px-2 font-display text-xs font-semibold text-muted-foreground">
            {ch.title.replace(/【.*?】/g, "")}
          </p>
          {ch.intro.trim() ? (
            <TocRow
              active={currentChapter === ch.id && currentSection === "intro"}
              mastered={Boolean(mastered[sectionKey(ch.id, "intro")])}
              label="章首"
              onClick={() => onPick(ch.id, "intro")}
            />
          ) : null}
          {ch.sections.map((sec) => (
            <TocRow
              key={sec.id}
              active={currentChapter === ch.id && currentSection === sec.id}
              mastered={Boolean(mastered[sectionKey(ch.id, sec.id)])}
              label={sec.title}
              priority={sec.priority}
              onClick={() => onPick(ch.id, sec.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function TocRow({
  active,
  mastered,
  label,
  priority,
  onClick,
}: {
  active: boolean;
  mastered: boolean;
  label: string;
  priority?: Priority;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm leading-snug transition-colors duration-150",
        active
          ? "bg-sunken font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
      data-active={active ? "true" : undefined}
    >
      <span
        className={cn(
          "mt-1 size-1.5 shrink-0 rounded-full",
          mastered ? "bg-pine" : "bg-border",
        )}
      />
      <span className="min-w-0">
        <span className="line-clamp-2">{label}</span>
        {priority && priority !== "guide" ? (
          <span
            className={cn(
              "mt-0.5 block text-[0.625rem]",
              priority === "focus" && "text-cinnabar",
              priority === "optional" && "text-pine",
              priority === "out" && "text-subtle line-through",
            )}
          >
            {priority === "focus" ? "重点" : priority === "out" ? "不考" : "选择性"}
          </span>
        ) : null}
      </span>
    </button>
  );
}
