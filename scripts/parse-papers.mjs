import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(
  new URL("../attachments/东北大学数值分析_11套真题按章详解.md", import.meta.url),
  "utf8",
).replace(/\r/g, "");

const chapterOf = (heading) => {
  if (heading.startsWith("第1章")) return { chapterId: "ch1", chapter: "第1章 误差" };
  if (heading.startsWith("第2章")) return { chapterId: "ch2", chapter: "第2章 直接法" };
  if (heading.startsWith("第3章")) return { chapterId: "ch3", chapter: "第3章 迭代法" };
  if (heading.startsWith("第4章")) return { chapterId: "ch4", chapter: "第4章 求根" };
  if (heading.startsWith("第6章")) return { chapterId: "ch6", chapter: "第6章 插值与拟合" };
  if (heading.startsWith("第7章")) return { chapterId: "ch7", chapter: "第7章 数值积分" };
  if (heading.startsWith("第8章")) return { chapterId: "ch8", chapter: "第8章 常微分方程" };
  if (heading.startsWith("原件缺失")) return { chapterId: "missing", chapter: "缺题" };
  return null;
};

function splitTags(body) {
  const tags = body.match(/\\tag\s*\{/g) || [];
  if (tags.length <= 1) return [body];
  return body
    .split(/\\qquad\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function reflowText(text) {
  const lines = text.split("\n");
  let out = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      out += line;
      continue;
    }
    const prev = lines[i - 1];
    const table = (s) => /^\s*\|/.test(s);
    if (line.trim() === "" || prev.trim() === "" || table(line) || table(prev)) out += `\n${line}`;
    else out += `\n\n${line}`;
  }
  return out;
}

export function formatMarkdown(text, { reflow = false } = {}) {
  if (!text) return text;
  const parts = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    parts.push({ t: "text", v: buf });
    buf = "";
  };
  while (i < text.length) {
    if (text.startsWith("$$", i)) {
      const end = text.indexOf("$$", i + 2);
      if (end < 0) {
        buf += text.slice(i);
        break;
      }
      flush();
      parts.push({ t: "math", v: text.slice(i + 2, end) });
      i = end + 2;
      continue;
    }
    buf += text[i];
    i += 1;
  }
  flush();
  let out = "";
  for (const part of parts) {
    if (part.t === "text") {
      out += reflow ? reflowText(part.v) : part.v;
      continue;
    }
    for (const body of splitTags(part.v)) {
      const trimmed = body.trim();
      if (!trimmed) continue;
      out += `\n\n$$\n${trimmed}\n$$\n\n`;
    }
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function classify(raw) {
  const name = raw.replace(/[：:。．\s]+$/u, "");
  if (name.startsWith("出处")) return "source";
  if (name.startsWith("题目")) return "question";
  if (name.startsWith("考点")) return "point";
  if (name.startsWith("解答") || name.startsWith("步骤")) return "solution";
  if (name.startsWith("答案") || name.startsWith("最终结论")) return "answer";
  return null;
}

function splitFields(body) {
  const buckets = { source: [], question: [], point: [], note: [], solution: [], answer: [] };
  let label = "pre";
  let buf = [];
  const flush = () => {
    const text = buf.join("\n").trim();
    if (text && buckets[label]) buckets[label].push(text);
    buf = [];
  };
  for (const line of body.split("\n")) {
    const m = line.match(/^\*\*([^*]+)\*\*\s*(.*)$/);
    if (m) {
      const lead = m[1].replace(/[：:。．\s]+$/u, "");
      let key = null;
      if (lead.startsWith("出处")) key = "source";
      else if (lead.startsWith("题目")) key = "question";
      else if (lead.startsWith("考点")) key = "point";
      else if (lead.startsWith("扫描")) key = "note";
      else if (lead.startsWith("答案") || lead === "最终结论" || lead === "结论") key = "answer";
      else if (/^(解答|步骤)/.test(lead)) {
        flush();
        label = "solution";
        buf = [];
        if (!/^(解答|步骤)$/.test(lead)) buf.push(`**${m[1].trim()}**`);
        if (m[2]) buf.push(m[2]);
        continue;
      }
      if (key) {
        flush();
        label = key;
        buf = m[2] ? [m[2]] : [];
        continue;
      }
      if (label !== "solution") {
        flush();
        label = "solution";
      }
      buf.push(line);
      continue;
    }
    buf.push(line);
  }
  flush();
  const join = (name) => buckets[name].join("\n\n").trim();
  return {
    source: join("source"),
    question: join("question"),
    point: join("point"),
    note: join("note"),
    solution: join("solution"),
    answer: join("answer"),
  };
}

function scopeOf(point, solution, question) {
  const blob = `${point}\n${question}`;
  if (/原文件缺少|无法可靠还原|缺题记录/.test(`${blob}\n${solution}`)) return "missing";
  if (/已划叉|不在本次考试范围|原范围外/.test(`${point}\n${solution.slice(0, 400)}`)) return "out";
  if (/选择性/.test(point)) return "optional";
  return "focus";
}

const problems = [];
let chapter = null;
let current = null;

function push() {
  if (!current || !chapter) {
    current = null;
    return;
  }
  const fields = splitFields(current.body);
  const question = fields.question || fields.pre;
  problems.push({
    id: current.id,
    year: current.year,
    number: current.number,
    title: current.title,
    ...chapter,
    source: fields.source,
    question: formatMarkdown(question, { reflow: true }),
    point: formatMarkdown(fields.point),
    note: formatMarkdown(fields.note),
    solution: formatMarkdown(fields.solution, { reflow: true }),
    answer: formatMarkdown(fields.answer, { reflow: true }),
    scope: scopeOf(fields.point, fields.solution, question),
  });
  current = null;
}

for (const line of src.split("\n")) {
  if (line.startsWith("## ") && !line.startsWith("### ")) {
    push();
    chapter = chapterOf(line.slice(3).trim());
    continue;
  }
  const head = line.match(/^###\s+(.+?)\s+\{#([^}]+)\}\s*$/);
  if (head) {
    push();
    const raw = head[1];
    const id = head[2];
    const yearMatch = raw.match(/^(\d{4})\s*[—–-]\s*(\d{4})\s+(.+)$/);
    const year = yearMatch ? `${yearMatch[1]}-${yearMatch[2]}` : "";
    const rest = yearMatch ? yearMatch[3] : raw;
    const split = rest.split(/[：:]/);
    const number = (split[0] ?? rest).trim();
    const title = (split.slice(1).join("：") || number).trim();
    current = { id, year, number, title, body: "" };
    continue;
  }
  if (current) current.body += `${line}\n`;
}
push();

const emptyQ = problems.filter((p) => !p.question);
const emptyS = problems.filter((p) => p.scope !== "missing" && !p.solution);
console.log(
  JSON.stringify(
    {
      n: problems.length,
      byChapter: problems.reduce((a, p) => ((a[p.chapterId] = (a[p.chapterId] ?? 0) + 1), a), {}),
      byScope: problems.reduce((a, p) => ((a[p.scope] = (a[p.scope] ?? 0) + 1), a), {}),
      emptyQ: emptyQ.map((p) => p.id),
      emptyS: emptyS.map((p) => p.id),
    },
    null,
    2,
  ),
);

writeFileSync(
  new URL("../src/lib/content/papers.json", import.meta.url),
  JSON.stringify(problems),
);
