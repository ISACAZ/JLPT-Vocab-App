import "dotenv/config";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

function esc(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

function readJLPT(file: string, level: string): string {
  const content = fs.readFileSync(path.join("data", file), "utf-8");
  const records = parse(content, { columns: true, skip_empty_lines: true, bom: true, relax_column_count: true });
  const lines: string[] = [];
  for (const r of records) {
    const kanji = (r.expression || "").trim();
    const kana = (r.reading || "").trim() || kanji;
    const meaning = (r.meaning || "").trim();
    if (!kanji && !kana) continue;
    lines.push(`${esc(kanji)}\t${esc(kana)}\t${esc(meaning)}\tjlpt\t${esc(level)}`);
  }
  return lines.join("\n");
}

const levels = ["n5", "n4", "n3", "n2", "n1"];
const levelNames = ["N5", "N4", "N3", "N2", "N1"];

let sql = "";
sql += "PRAGMA synchronous = OFF;\n";
sql += "PRAGMA journal_mode = WAL;\n";

for (let i = 0; i < levels.length; i++) {
  const words = readJLPT(levels[i], levelNames[i]).split("\n");
  sql += `INSERT OR IGNORE INTO Category (name, type) VALUES (${esc(`JLPT ${levelNames[i]}`)}, 'jlpt');\n`;
  
  // Use INSERT with a SELECT from a VALUES table
  const stmt = `INSERT OR IGNORE INTO Word (kanji, kana, meaning, source, jlptLevel) VALUES `;
  const batch: string[] = [];
  for (let j = 0; j < words.length; j++) {
    const [kanji, kana, meaning, source, lvl] = words[j].split("\t");
    batch.push(`(${kanji}, ${kana}, ${meaning}, ${source}, ${lvl})`);
    if (batch.length >= 500 || j === words.length - 1) {
      sql += stmt + batch.join(",\n") + ";\n";
      batch.length = 0;
    }
  }
}

for (let i = 0; i < levels.length; i++) {
  const lvl = levelNames[i];
  sql += `INSERT OR IGNORE INTO WordCategory (wordId, categoryId) SELECT w.id, c.id FROM Word w, Category c WHERE w.jlptLevel = ${esc(lvl)} AND w.source = 'jlpt' AND c.name = ${esc(`JLPT ${lvl}`)};\n`;
}

fs.writeFileSync("data/seed.sql", sql);
console.log("SQL file generated: data/seed.sql");
console.log(`${sql.length} bytes`);
