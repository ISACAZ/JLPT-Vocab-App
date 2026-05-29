import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

function esc(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

const out: string[] = [];

function append(sql: string) {
  out.push(sql);
}

const levels = ["n5", "n4", "n3", "n2", "n1"];
const levelNames = ["N5", "N4", "N3", "N2", "N1"];

for (let i = 0; i < levels.length; i++) {
  const file = levels[i];
  const lvl = levelNames[i];
  
  const content = fs.readFileSync(path.join("data", `${file}.csv`), "utf-8");
  const records = parse(content, { columns: true, skip_empty_lines: true, bom: true, relax_column_count: true });
  
  append(`INSERT OR IGNORE INTO Category (name, type) VALUES (${esc(`JLPT ${lvl}`)}, 'jlpt');`);

  const values: string[] = [];
  for (const r of records) {
    const kanji = (r.expression || "").trim();
    const kana = (r.reading || "").trim() || kanji;
    const meaning = (r.meaning || "").trim();
    if (!kanji && !kana) continue;
    values.push(`(${esc(kanji)},${esc(kana)},${esc(meaning)},'jlpt',${esc(lvl)})`);
  }

  const BATCH = 500;
  for (let j = 0; j < values.length; j += BATCH) {
    const batch = values.slice(j, j + BATCH);
    append(`INSERT OR IGNORE INTO Word (kanji,kana,meaning,source,jlptLevel) VALUES ${batch.join(",")};`);
  }
}

// Link categories for JLPT
for (const lvl of levelNames) {
  append(`INSERT OR IGNORE INTO WordCategory (wordId, categoryId) SELECT w.id, c.id FROM Word w, Category c WHERE w.jlptLevel = ${esc(lvl)} AND w.source = 'jlpt' AND c.name = ${esc(`JLPT ${lvl}`)};`);
}

// Minna no Nihongo
const mnnContent = fs.readFileSync(path.join("data", "MNNvocab.csv"), "utf-8");
const lines = mnnContent.split("\n");

let currentLesson = "";
const mnnValues: { lesson: string; kanji: string; kana: string; meaning: string }[] = [];

for (const line of lines) {
  const t = line.trim();
  if (!t) continue;
  const m = t.match(/^"Lesson\s*(\d+)"\s*,/i);
  if (m) {
    currentLesson = `Minna no Nihongo Lesson ${m[1]}`;
    append(`INSERT OR IGNORE INTO Category (name, type) VALUES (${esc(currentLesson)}, 'minna');`);
    continue;
  }
  if (!currentLesson) continue;
  const parts = parse(t, { skip_empty_lines: true, relax_column_count: true })[0];
  if (!parts || parts.length < 3) continue;
  const kanji = (parts[0] || "").trim();
  const kana = (parts[1] || "").trim() || kanji;
  const meaning = (parts[2] || "").trim();
  if (!kanji && !kana) continue;
  mnnValues.push({ lesson: currentLesson, kanji, kana, meaning });
}

const byLesson = new Map<string, typeof mnnValues>();
for (const w of mnnValues) {
  if (!byLesson.has(w.lesson)) byLesson.set(w.lesson, []);
  byLesson.get(w.lesson)!.push(w);
}

for (const [lesson, words] of byLesson) {
  const BATCH = 500;
  for (let j = 0; j < words.length; j += BATCH) {
    const batch = words.slice(j, j + BATCH);
    const vals = batch.map(w => `(${esc(w.kanji)},${esc(w.kana)},${esc(w.meaning)},'minna',NULL)`);
    append(`INSERT OR IGNORE INTO Word (kanji,kana,meaning,source,jlptLevel) VALUES ${vals.join(",")};`);
  }

  // Link each word individually to avoid expression tree depth limits
  for (const w of words) {
    append(`INSERT OR IGNORE INTO WordCategory (wordId, categoryId) SELECT w.id, c.id FROM Word w, Category c WHERE w.kanji = ${esc(w.kanji)} AND w.kana = ${esc(w.kana)} AND w.source = 'minna' AND c.name = ${esc(lesson)} LIMIT 1;`);
  }
}

fs.writeFileSync("data/seed.sql", out.join("\n"));
const stats = fs.statSync("data/seed.sql");
console.log(`Generated: data/seed.sql (${(stats.size / 1024 / 1024).toFixed(1)} MB, ${out.length} statements)`);
