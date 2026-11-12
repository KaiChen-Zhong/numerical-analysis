import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TeX } from "@/components/tex";
import { PriorityBadge } from "@/components/priority-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FORMULAS } from "@/lib/content/formulas";
import { getChapter, shortChapterTitle } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/formulas")({ component: FormulasPage });

function FormulasPage() {
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const chapters = useMemo(
    () =>
      Array.from(
        new Set(FORMULAS.filter((f) => f.priority !== "out").map((f) => f.chapterId)),
      ),
    [],
  );

  const list = FORMULAS.filter((f) => {
    if (filter === "all" && f.priority === "out") return false;
    if (filter === "out" && f.priority !== "out") return false;
    if (filter !== "all" && filter !== "out" && f.chapterId !== filter) return false;
    if (!q.trim()) return true;
    const hay = `${f.title}${f.note}${f.section}${f.latex}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-medium tracking-[0.16em] text-cinnabar">速查</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">公式与条件</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        每章章首也列着同一套式子，并配一道算到底的例题。默认这里只列考试范围。先看成立条件，再套公式。第9章差分格式不考，在「不考」里翻。
      </p>

      <div className="sticky top-14 z-10 -mx-4 mt-6 bg-background/90 px-4 py-3 backdrop-blur-sm">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索：条件数、余项、稳定函数…"
        />
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            考试范围
          </FilterChip>
          {chapters.map((id) => {
            const ch = getChapter(id);
            return (
              <FilterChip key={id} active={filter === id} onClick={() => setFilter(id)}>
                {ch ? shortChapterTitle(ch) : id}
              </FilterChip>
            );
          })}
          <FilterChip active={filter === "out"} onClick={() => setFilter("out")}>
            不考
          </FilterChip>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">没有匹配的公式</p>
        ) : null}
        {list.map((f) => (
          <article
            key={f.id}
            className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={f.priority} />
              <h2 className="font-display text-lg font-semibold">{f.title}</h2>
              <span className="text-xs text-subtle">{f.section}</span>
            </div>
            <div className="mt-3 text-foreground">
              <TeX latex={f.latex} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{f.note}</p>
            <Link
              to="/read/$chapterId"
              params={{ chapterId: f.chapterId }}
              search={{ s: f.section }}
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="chip"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={cn("shrink-0", !active && "bg-card")}
    >
      {children}
    </Button>
  );
}
