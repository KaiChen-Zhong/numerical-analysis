import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Binary, Home, Library, ListChecks, Route, Search, Sigma, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PriorityBadge } from "@/components/priority-badge";
import {
  STUDY_CHAPTERS,
  allReadableSections,
  chapterNumberLabel,
  chapterPriority,
  searchContent,
  shortChapterTitle,
} from "@/lib/content";
import { AI_LESSONS, searchAi } from "@/lib/ai-track";
import { MOVES, searchMoves } from "@/lib/content/moves";
import { PAPER_CHAPTERS, PAPERS, searchPapers } from "@/lib/content/papers";
import { sectionKey, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastChapterId = useProgress((s) => s.lastChapterId);
  const mastered = useProgress((s) => s.mastered);
  const aiMastered = useProgress((s) => s.aiMastered) ?? {};
  const movesDone = useProgress((s) => s.movesDone) ?? {};
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lectureChapter = lastChapterId ?? "ch1";

  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);

  const focusTotal = useMemo(
    () => allReadableSections().filter((x) => x.priority === "focus").length,
    [],
  );
  const focusDone = useMemo(() => {
    return allReadableSections().filter(
      (x) => x.priority === "focus" && mastered[sectionKey(x.chapterId, x.sectionId)],
    ).length;
  }, [mastered]);

  const hits = useMemo(() => {
    if (q.trim().length < 1) return [];
    const moves = searchMoves(q, 6).map((h) => ({
      kind: "move" as const,
      id: h.id,
      title: h.title,
      snippet: h.snippet,
    }));
    const lecture = searchContent(q, 8).map((h) => ({
      kind: "lecture" as const,
      ...h,
    }));
    const ai = searchAi(q, 6).map((h) => ({
      kind: "ai" as const,
      lessonId: h.lessonId,
      title: h.title,
      snippet: h.snippet,
    }));
    const papers = searchPapers(q, 6).map((h) => ({
      kind: "paper" as const,
      id: h.id,
      title: h.title,
      snippet: h.snippet,
    }));
    return [...papers, ...moves, ...lecture, ...ai].slice(0, 16);
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <Link to="/" className="block px-5 pt-6 pb-4">
          <p className="font-display text-lg font-semibold tracking-tight">数值分析</p>
          <p className="mt-0.5 text-xs text-muted-foreground">考试知识点讲义</p>
        </Link>
        <nav className="flex flex-col gap-0.5 px-3">
          <NavItem to="/" active={pathname === "/"} icon={Home} label="首页" />
          <NavItem to="/learn" active={pathname.startsWith("/learn")} icon={Route} label="手法" />
          <NavItem
            to="/read/$chapterId"
            params={{ chapterId: lectureChapter }}
            active={pathname.startsWith("/read")}
            icon={BookOpen}
            label="讲义"
          />
          <NavItem
            to="/ai"
            active={pathname.startsWith("/ai")}
            icon={Binary}
            label="AI 视角"
          />
          <NavItem
            to="/exams"
            active={pathname.startsWith("/exams")}
            icon={Library}
            label="真题"
          />
          <NavItem
            to="/formulas"
            active={pathname.startsWith("/formulas")}
            icon={Sigma}
            label="公式"
          />
          <NavItem
            to="/drill"
            active={pathname.startsWith("/drill")}
            icon={ListChecks}
            label="自测"
          />
        </nav>
        <div className="mt-5 flex min-h-0 flex-1 flex-col px-4">
          <p className="mb-2 px-1 text-[0.6875rem] font-medium tracking-wide text-subtle">
            {pathname.startsWith("/learn") ? "手法" : pathname.startsWith("/ai") ? "AI 路径" : pathname.startsWith("/exams") ? "真题" : "章节"}
          </p>
          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
            {pathname.startsWith("/exams")
              ? PAPER_CHAPTERS.map((ch) => {
                  const n = PAPERS.filter((p) => p.chapterId === ch.id).length;
                  return (
                    <Link
                      key={ch.id}
                      to="/exams"
                      search={{ c: ch.id }}
                      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-[0.8125rem] text-muted-foreground transition-colors duration-150 hover:bg-muted/70 hover:text-foreground"
                    >
                      <span className="min-w-0 flex-1 truncate">{ch.label}</span>
                      <span className="font-display text-xs tabular-nums text-subtle">{n}</span>
                    </Link>
                  );
                })
              : pathname.startsWith("/learn")
              ? MOVES.map((m, i) => {
                  const active = pathname === `/learn/${m.id}`;
                  return (
                    <Link
                      key={m.id}
                      to="/learn/$moveId"
                      params={{ moveId: m.id }}
                      className={cn(
                        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-[0.8125rem] transition-colors duration-150",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <span className="w-5 shrink-0 font-display text-xs tabular-nums text-subtle">
                        {i + 1}
                      </span>
                      <span className={cn("min-w-0 truncate", movesDone[m.id] && "text-pine")}>
                        {m.title}
                      </span>
                    </Link>
                  );
                })
              : pathname.startsWith("/ai")
              ? AI_LESSONS.map((l) => {
                  const active = pathname === `/ai/${l.id}`;
                  return (
                    <Link
                      key={l.id}
                      to="/ai/$lessonId"
                      params={{ lessonId: l.id }}
                      className={cn(
                        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-[0.8125rem] transition-colors duration-150",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <span className="w-5 shrink-0 font-display text-xs tabular-nums text-subtle">
                        {l.n}
                      </span>
                      <span className="min-w-0 truncate">{l.title}</span>
                    </Link>
                  );
                })
              : STUDY_CHAPTERS.map((ch) => {
                  const active = pathname === `/read/${ch.id}`;
                  const out = chapterPriority(ch) === "out";
                  return (
                    <Link
                      key={ch.id}
                      to="/read/$chapterId"
                      params={{ chapterId: ch.id }}
                      className={cn(
                        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-[0.8125rem] transition-colors duration-150",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <span className="w-5 shrink-0 font-display text-xs tabular-nums text-subtle">
                        {chapterNumberLabel(ch.id)}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 truncate",
                          out && "text-subtle line-through decoration-subtle",
                        )}
                      >
                        {shortChapterTitle(ch)}
                      </span>
                      {out ? (
                        <span className="shrink-0 text-[0.625rem] text-subtle">不考</span>
                      ) : null}
                    </Link>
                  );
                })}
          </div>
        </div>
        <div className="mt-auto border-t border-border px-5 py-4">
          <p className="text-[0.6875rem] text-subtle">
            {pathname.startsWith("/learn")
              ? "手法会写"
              : pathname.startsWith("/ai")
                ? "AI 路径"
                : "重点掌握"}
          </p>
          <p className="mt-1 font-display text-lg tabular-nums">
            {pathname.startsWith("/learn")
              ? MOVES.filter((m) => movesDone[m.id]).length
              : pathname.startsWith("/ai")
                ? AI_LESSONS.filter((l) => aiMastered[l.id]).length
                : focusDone}
            <span className="text-sm text-muted-foreground">
              {" "}
              /{" "}
              {pathname.startsWith("/learn")
                ? MOVES.length
                : pathname.startsWith("/ai")
                  ? AI_LESSONS.length
                  : focusTotal}
            </span>
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-sunken">
            <div
              className={cn(
                "h-full transition-[width] duration-300",
                pathname.startsWith("/ai") ? "bg-pine" : "bg-primary",
              )}
              style={{
                width: pathname.startsWith("/learn")
                  ? `${(100 * MOVES.filter((m) => movesDone[m.id]).length) / MOVES.length}%`
                  : pathname.startsWith("/ai")
                    ? `${(100 * AI_LESSONS.filter((l) => aiMastered[l.id]).length) / AI_LESSONS.length}%`
                    : `${focusTotal ? (100 * focusDone) / focusTotal : 0}%`,
              }}
            />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm lg:ml-60">
        <Link to="/" className="font-display text-base font-semibold tracking-tight lg:hidden">
          数值分析
        </Link>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="ml-auto flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 text-left text-sm text-subtle shadow-[var(--shadow-border)] lg:max-w-md"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">搜索手法、真题、公式、章节</span>
          <kbd className="ml-auto hidden rounded-sm border border-border px-1.5 py-0.5 text-[0.6875rem] text-subtle sm:inline">
            ⌘K
          </kbd>
        </button>
      </header>

      <main className="px-4 pb-24 pt-6 lg:ml-60 lg:px-8 lg:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
        <div className="grid grid-cols-7">
          <MobileItem to="/" active={pathname === "/"} icon={Home} label="首页" />
          <MobileItem to="/learn" active={pathname.startsWith("/learn")} icon={Route} label="手法" />
          <MobileItem
            to="/read/$chapterId"
            params={{ chapterId: lectureChapter }}
            active={pathname.startsWith("/read")}
            icon={BookOpen}
            label="讲义"
          />
          <MobileItem to="/exams" active={pathname.startsWith("/exams")} icon={Library} label="真题" />
          <MobileItem
            to="/ai"
            active={pathname.startsWith("/ai")}
            icon={Binary}
            label="AI"
          />
          <MobileItem
            to="/formulas"
            active={pathname.startsWith("/formulas")}
            icon={Sigma}
            label="公式"
          />
          <MobileItem
            to="/drill"
            active={pathname.startsWith("/drill")}
            icon={ListChecks}
            label="自测"
          />
        </div>
      </nav>

      {searchOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <button
            type="button"
            aria-label="关闭搜索"
            className="absolute inset-0 bg-overlay"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-xl bg-card p-3 shadow-[var(--shadow-border-hover)]">
            <div className="flex items-center gap-2">
              <Search className="size-4 text-subtle" />
              <Input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="输入关键词，如 条件数、softmax、量化"
                className="border-0 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-md hover:bg-muted"
                onClick={() => setSearchOpen(false)}
                aria-label="关闭"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-2 max-h-[50vh] overflow-y-auto">
              {q.trim() && hits.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  没有匹配的小节
                </p>
              ) : null}
              {hits.map((h) =>
                h.kind === "paper" ? (
                  <Link
                    key={`paper-${h.id}`}
                    to="/exams"
                    search={{ p: h.id }}
                    onClick={() => {
                      setSearchOpen(false);
                      setQ("");
                    }}
                    className="block rounded-md px-3 py-2.5 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6875rem] font-medium text-cinnabar">真题</span>
                      <span className="truncate text-sm font-medium">{h.title}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.snippet}</p>
                  </Link>
                ) : h.kind === "move" ? (
                  <Link
                    key={`move-${h.id}`}
                    to="/learn/$moveId"
                    params={{ moveId: h.id }}
                    onClick={() => {
                      setSearchOpen(false);
                      setQ("");
                    }}
                    className="block rounded-md px-3 py-2.5 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6875rem] font-medium text-cinnabar">手法</span>
                      <span className="truncate text-sm font-medium">{h.title}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.snippet}</p>
                  </Link>
                ) : h.kind === "ai" ? (
                  <Link
                    key={`ai-${h.lessonId}`}
                    to="/ai/$lessonId"
                    params={{ lessonId: h.lessonId }}
                    onClick={() => {
                      setSearchOpen(false);
                      setQ("");
                    }}
                    className="block rounded-md px-3 py-2.5 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6875rem] font-medium text-pine">AI</span>
                      <span className="truncate text-sm font-medium">{h.title}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.snippet}</p>
                  </Link>
                ) : (
                  <Link
                    key={`${h.chapterId}-${h.sectionId}-${h.title}`}
                    to="/read/$chapterId"
                    params={{ chapterId: h.chapterId }}
                    search={{ s: h.sectionId }}
                    onClick={() => {
                      setSearchOpen(false);
                      setQ("");
                    }}
                    className="block rounded-md px-3 py-2.5 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={h.priority} />
                      <span className="truncate text-sm font-medium">{h.title}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{h.snippet}</p>
                  </Link>
                ),
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NavItem({
  to,
  params,
  active,
  icon: Icon,
  label,
}: {
  to: "/" | "/formulas" | "/drill" | "/read/$chapterId" | "/ai" | "/learn" | "/exams";
  params?: { chapterId: string };
  active: boolean;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        "flex h-10 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors duration-150",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

function MobileItem({
  to,
  params,
  active,
  icon: Icon,
  label,
}: {
  to: "/" | "/formulas" | "/drill" | "/read/$chapterId" | "/ai" | "/learn" | "/exams";
  params?: { chapterId: string };
  active: boolean;
  icon: typeof Home;
  label: string;
}) {
  return (
    <Link
      to={to}
      params={params}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.6875rem]",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" strokeWidth={active ? 2 : 1.75} />
      {label}
    </Link>
  );
}
