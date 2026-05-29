import "dotenv/config";
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function esc(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

async function exec(sql: string) {
  try {
    await client.execute(sql);
  } catch (e: any) {
    console.error("SQL Error:", e.message?.slice(0, 200));
  }
}

function readJLPT(file: string, level: string): string[] {
  const content = fs.readFileSync(path.join("data", file), "utf-8");
  const records = parse(content, { columns: true, skip_empty_lines: true, bom: true, relax_column_count: true });
  const out: string[] = [];
  for (const r of records) {
    const kanji = (r.expression || "").trim();
    const kana = (r.reading || "").trim() || kanji;
    const meaning = (r.meaning || "").trim();
    if (!kanji && !kana) continue;
    out.push(`(${esc(kanji)},${esc(kana)},${esc(meaning)},'jlpt',${esc(level)})`);
  }
  return out;
}

async function main() {
  console.log("Seeding...");

  const levels = [
    { file: "n5.csv", level: "N5" },
    { file: "n4.csv", level: "N4" },
    { file: "n3.csv", level: "N3" },
    { file: "n2.csv", level: "N2" },
    { file: "n1.csv", level: "N1" },
  ];

  // Create JLPT categories
  for (const { level } of levels) {
    await exec(`INSERT OR IGNORE INTO Category (name, type) VALUES (${esc(`JLPT ${level}`)},'jlpt')`);
  }

  // Create Minna categories
  const mnnContent = fs.readFileSync(path.join("data", "MNNvocab.csv"), "utf-8");
  const mnnLines = mnnContent.split("\n");
  const mnnLessons: string[] = [];
  for (const line of mnnLines) {
    const m = line.trim().match(/^"Lesson\s*(\d+)"\s*,/i);
    if (m) mnnLessons.push(`Minna no Nihongo Lesson ${m[1]}`);
  }
  for (const lesson of mnnLessons) {
    await exec(`INSERT OR IGNORE INTO Category (name, type) VALUES (${esc(lesson)},'minna')`);
  }

  // Insert JLPT words in batches & link categories
  const BATCH = 200;
  for (const { file, level } of levels) {
    const words = readJLPT(file, level);
    console.log(`JLPT ${level}: ${words.length}`);

    const catId = (await client.execute({ sql: "SELECT id FROM Category WHERE name = ?", args: [`JLPT ${level}`] })).rows[0].id;

    for (let i = 0; i < words.length; i += BATCH) {
      const batch = words.slice(i, i + BATCH);
      const sql = `INSERT OR IGNORE INTO Word (kanji,kana,meaning,source,jlptLevel) VALUES ${batch.join(",")}`;
      await exec(sql);
    }

    await exec(`INSERT OR IGNORE INTO WordCategory (wordId, categoryId) SELECT w.id, ${catId} FROM Word w WHERE w.jlptLevel = ${esc(level)} AND w.source = 'jlpt'`);
  }

  // Insert Minna words in batches & link categories
  const minnaWords: { lesson: string; kanji: string; kana: string; meaning: string }[] = [];
  let currentLesson = "";
  for (const line of mnnLines) {
    const t = line.trim();
    if (!t) continue;
    const m = t.match(/^"Lesson\s*(\d+)"\s*,/i);
    if (m) { currentLesson = `Minna no Nihongo Lesson ${m[1]}`; continue; }
    if (!currentLesson) continue;
    const parts = parse(t, { skip_empty_lines: true, relax_column_count: true })[0];
    if (!parts || parts.length < 3) continue;
    const kanji = (parts[0] || "").trim();
    const kana = (parts[1] || "").trim() || kanji;
    const meaning = (parts[2] || "").trim();
    if (!kanji && !kana) continue;
    minnaWords.push({ lesson: currentLesson, kanji, kana, meaning });
  }

  const mnnByLesson = new Map<string, typeof minnaWords>();
  for (const w of minnaWords) {
    if (!mnnByLesson.has(w.lesson)) mnnByLesson.set(w.lesson, []);
    mnnByLesson.get(w.lesson)!.push(w);
  }

  for (const [lesson, words] of mnnByLesson) {
    console.log(`${lesson}: ${words.length}`);

    const catId = (await client.execute({ sql: "SELECT id FROM Category WHERE name = ?", args: [lesson] })).rows[0].id;

    for (let i = 0; i < words.length; i += BATCH) {
      const batch = words.slice(i, i + BATCH);
      const sql = `INSERT OR IGNORE INTO Word (kanji,kana,meaning,source,jlptLevel) VALUES ${batch.map(w => `(${esc(w.kanji)},${esc(w.kana)},${esc(w.meaning)},'minna',NULL)`).join(",")}`;
      await exec(sql);
    }

    // Link by matching kanji+kana within this lesson batch
    for (const w of words) {
      const result = await client.execute({
        sql: "SELECT id FROM Word WHERE kanji = ? AND kana = ? AND source = 'minna' LIMIT 1",
        args: [w.kanji, w.kana],
      });
      if (result.rows.length > 0) {
        await exec(`INSERT OR IGNORE INTO WordCategory (wordId, categoryId) VALUES (${result.rows[0].id}, ${catId})`);
      }
    }
  }

  const count = await client.execute("SELECT COUNT(*) as cnt FROM Word");
  console.log(`Total words: ${count.rows[0].cnt}`);
  const catCount = await client.execute("SELECT COUNT(*) as cnt FROM Category");
  console.log(`Total categories: ${catCount.rows[0].cnt}`);
  console.log("Done!");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
