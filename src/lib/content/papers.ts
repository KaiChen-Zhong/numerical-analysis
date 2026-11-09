import papers from "./papers.json";

export type PaperScope = "focus" | "optional" | "out" | "missing";

export type Paper = {
  id: string;
  year: string;
  number: string;
  title: string;
  chapterId: string;
  chapter: string;
  source: string;
  question: string;
  point: string;
  note: string;
  solution: string;
  answer: string;
  scope: PaperScope;
};

export const PAPERS = papers as Paper[];

export const PAPER_CHAPTERS: { id: string; label: string }[] = [
  { id: "ch1", label: "1 误差" },
  { id: "ch2", label: "2 直接法" },
  { id: "ch3", label: "3 迭代法" },
  { id: "ch4", label: "4 求根" },
  { id: "ch6", label: "6 插值拟合" },
  { id: "ch7", label: "7 数值积分" },
  { id: "ch8", label: "8 常微分方程" },
  { id: "missing", label: "缺题" },
];

export const PAPER_YEARS = [...new Set(PAPERS.map((p) => p.year))];

export function papersIn(chapterId?: string, year?: string) {
  return PAPERS.filter((p) => {
    if (chapterId && chapterId !== "all" && p.chapterId !== chapterId) return false;
    if (year && year !== "all" && p.year !== year) return false;
    return true;
  });
}

export function searchPapers(query: string, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: { id: string; title: string; snippet: string }[] = [];
  for (const p of PAPERS) {
    const text = `${p.year} ${p.number} ${p.title} ${p.point} ${p.question}`.toLowerCase();
    const idx = text.indexOf(q);
    if (idx === -1) continue;
    const start = Math.max(0, idx - 12);
    hits.push({
      id: p.id,
      title: `${p.year} ${p.number} ${p.title}`,
      snippet: (start > 0 ? "…" : "") + text.slice(start, start + 80),
    });
    if (hits.length >= limit) break;
  }
  return hits;
}
