import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { MarkdownView } from "@/components/markdown-view";
import {
  PAPER_CHAPTERS,
  PAPER_YEARS,
  papersIn,
  type Paper,
  type PaperScope,
} from "@/lib/content/papers";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Search = { c?: string; y?: string; p?: string };

export const Route = createFileRoute("/exams")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    c: typeof s.c === "string" ? s.c : undefined,
    y: typeof s.y === "string" ? s.y : undefined,
    p: typeof s.p === "string" ? s.p : undefined,
  }),
  component: ExamsPage,
});

const SCOPE_LABEL: Record<PaperScope, string> = {
  focus: "重点",
  optional: "选择性",
  out: "原范围外",
  missing: "缺题",
};

function ExamsPage() {
  const { c, y, p } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const doneMap = useProgress((s) => s.examsDone) ?? {};
  const toggleExam = useProgress((s) => s.toggleExam);

  useEffect(() => {
    if (!p) return;
    setOpen((s) => ({ ...s, [p]: true }));
    const el = document.getElementById(p);
    el?.scrollIntoView({ block: "start" });
  }, [p]);

  const list = useMemo(() => {
    const base = papersIn(c, y);
    const query = q.trim().toLowerCase();
    if (!query) return base;
    return base.filter((item) =>
      `${item.year} ${item.number} ${item.title} ${item.point} ${item.question}`
        .toLowerCase()
        .includes(query),
    );
  }, [c, y, q]);

  const done = list.filter((item) => doneMap[item.id]).length;

  function go(next: Search) {
    void navigate({
      to: "/exams",
      search: {
        c: next.c,
        y: next.y,
        p: undefined,
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-medium tracking-[0.16em] text-cinnabar">东北大学期末</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">11 套真题</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        2015–2016 到 2025–2026，按教材章节排。先看题自己做，详解默认收着。划叉的内容如果真的考过，标成原范围外，仍然留在这里。2016–2017 第七题原卷是空白，没有编造。
      </p>
      <p className="mt-3 text-xs text-subtle">
        这一筛里 {done} / {list.length} 题标过做过
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!c} onClick={() => go({ y })}>
          全部章
        </Chip>
        {PAPER_CHAPTERS.map((ch) => (
          <Chip key={ch.id} active={c === ch.id} onClick={() => go({ c: ch.id, y })}>
            {ch.label}
          </Chip>
        ))}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!y} onClick={() => go({ c })}>
          全部年份
        </Chip>
        {PAPER_YEARS.map((year) => (
          <Chip key={year} active={y === year} onClick={() => go({ c, y: year })}>
            {year}
          </Chip>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="在这一筛里找题，如 条件数、Simpson、有效数字"
        className="mt-4 h-11 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="mt-6 flex flex-col gap-4">
        {list.map((item) => (
          <PaperCard
            key={item.id}
            item={item}
            open={Boolean(open[item.id])}
            done={Boolean(doneMap[item.id])}
            onToggleOpen={() => setOpen((s) => ({ ...s, [item.id]: !s[item.id] }))}
            onToggleDone={() => toggleExam(item.id)}
          />
        ))}
        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">这一筛里没有题</p>
        ) : null}
      </div>
    </div>
  );
}

function PaperCard({
  item,
  open,
  done,
  onToggleOpen,
  onToggleDone,
}: {
  item: Paper;
  open: boolean;
  done: boolean;
  onToggleOpen: () => void;
  onToggleDone: () => void;
}) {
  return (
    <article id={item.id} className="scroll-mt-20 rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {item.year} · {item.number}
        </span>
        <span
          className={cn(
            "text-[0.625rem] font-medium",
            item.scope === "focus" && "text-cinnabar",
            item.scope === "optional" && "text-pine",
            (item.scope === "out" || item.scope === "missing") && "text-subtle",
          )}
        >
          {SCOPE_LABEL[item.scope]}
        </span>
      </div>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">{item.title}</h2>
      {item.point ? <p className="mt-1 text-sm text-muted-foreground">{item.point}</p> : null}
      {item.note ? <p className="mt-1 text-sm text-muted-foreground">{item.note}</p> : null}
      <div className="mt-4">
        <MarkdownView markdown={item.question || "_原卷没有题面。_"} />
      </div>
      {item.scope === "missing" && item.solution ? (
        <p className="mt-3 text-sm text-muted-foreground">{item.solution}</p>
      ) : null}
      <p className="mt-2 text-xs text-subtle">{item.source}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3">
        {item.scope !== "missing" ? (
          <button
            type="button"
            onClick={onToggleOpen}
            className="flex h-11 items-center text-sm font-medium text-primary"
          >
            {open ? "收起详解" : "看详解"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleDone}
          className={cn(
            "flex h-11 items-center gap-1.5 rounded-md px-3 text-sm",
            done ? "bg-pine text-pine-foreground" : "bg-muted text-foreground",
          )}
        >
          <Check className="size-4" />
          {done ? "做过" : "标为做过"}
        </button>
      </div>
      {open && item.scope !== "missing" ? (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-medium tracking-wide text-primary">详解</p>
          <MarkdownView markdown={item.solution} className="mt-2" />
          {item.answer ? (
            <div className="mt-4 rounded-xl bg-sunken p-4">
              <p className="text-xs font-medium tracking-wide text-pine">核对</p>
              <MarkdownView markdown={item.answer} className="mt-2" />
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full px-3 text-sm",
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
