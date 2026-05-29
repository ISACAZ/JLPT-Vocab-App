<div align="center">
  <h1>📖 Vocab JP</h1>
  <p><strong>Japanese Vocabulary Learning App</strong> — 日本語語彙学習アプリ</p>
  <p>แอปท่องจำคำศัพท์ภาษาญี่ปุ่น พร้อมระบบ SRS, Quiz, และข้อมูล JLPT + มินนะ โนะ นิฮงโกะ</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Turso-libSQL-4FC08D?style=flat-square&logo=sqlite" alt="Turso" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/shadcn/ui-components-000000?style=flat-square" alt="shadcn/ui" />
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#database">Database</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🃏 **SRS Flashcards** | Spaced Repetition System (SM-2 algorithm) — like Anki, built-in |
| ✍️ **Quiz** | Multiple choice & typing modes — kanji → meaning, meaning → kanji, meaning → reading |
| 📚 **30,000+ Words** | Pre-loaded JLPT N5–N1 + Minna no Nihongo I & II (50 lessons) |
| 🔍 **Word Browser** | Search, filter by JLPT level, source, pagination |
| 📖 **Jisho Integration** | Real-time lookup from Jisho.org for detailed word info |
| 📊 **Statistics** | Review progress, quiz accuracy, due counts, completion rate |
| ⚡ **Fast** | Edge-ready Turso database, serverless-friendly |

### SRS Algorithm (SM-2)

- After each flashcard review, rate **Again** / **Hard** / **Easy**
- The algorithm adjusts the interval — words you struggle with appear more often
- Due words automatically surface for review each day

---

## 🖼️ Screenshots

| Dashboard | Study (Flashcard) | Quiz |
|:---:|:---:|:---:|
| <img src="https://placehold.co/400x250/1a1a2e/eaeaea?text=Dashboard&font=montserrat" width="300"/> | <img src="https://placehold.co/400x250/16213e/eaeaea?text=Flashcards&font=montserrat" width="300"/> | <img src="https://placehold.co/400x250/0f3460/eaeaea?text=Quiz&font=montserrat" width="300"/> |

| Words Browser | Word Detail | Stats |
|:---:|:---:|:---:|
| <img src="https://placehold.co/400x250/1a1a2e/eaeaea?text=Browse+Words&font=montserrat" width="300"/> | <img src="https://placehold.co/400x250/16213e/eaeaea?text=Word+Detail&font=montserrat" width="300"/> | <img src="https://placehold.co/400x250/0f3460/eaeaea?text=Statistics&font=montserrat" width="300"/> |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Database** | [Turso](https://turso.tech) (libSQL — SQLite-compatible, edge-ready) |
| **ORM** | [Prisma](https://prisma.io) v7 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) v4 |
| **Components** | [shadcn/ui](https://ui.shadcn.com) |
| **State** | Zustand |
| **Charts** | Recharts |
| **External API** | [Jisho.org](https://jisho.org) (word lookup) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file:

```env
DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"
```

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Generate & apply schema + seed data
npx tsx prisma/gen-sql.ts     # generates data/seed.sql
turso db shell your-db-name < data/seed.sql
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database

### Schema

```prisma
model Word           { id, kanji, kana, meaning, pos, source, jlptLevel }
model Category       { id, name, type }           // "jlpt", "minna", "custom"
model WordCategory   { wordId, categoryId }       // many-to-many
model ReviewLog      { wordId, ease, interval, repetitions, nextReviewDate }
model QuizResult     { wordId, correct, date }
```

### Seeded Data

| Dataset | Words | Source |
|---------|-------|--------|
| JLPT N5 | ~800 | `open-anki-jlpt-decks` |
| JLPT N4 | ~1,500 | ^ |
| JLPT N3 | ~3,700 | ^ |
| JLPT N2 | ~6,000 | ^ |
| JLPT N1 | ~10,000 | ^ |
| Minna no Nihongo I & II | ~2,150 | Tohoku University |
| **Total** | **~30,000** | |

---

## 📁 Project Structure

```
Vocab/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script (TypeScript)
│   └── gen-sql.ts              # Generate SQL file for Turso bulk insert
├── src/
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   ├── layout.tsx          # Root layout + navigation
│   │   ├── study/page.tsx      # SRS flashcards
│   │   ├── quiz/page.tsx       # Quiz (multiple choice / typing)
│   │   ├── words/
│   │   │   ├── page.tsx        # Browse & search words
│   │   │   └── [id]/page.tsx   # Word detail + Jisho lookup
│   │   ├── stats/page.tsx      # Statistics & progress
│   │   └── api/                # API routes
│   │       ├── words/route.ts
│   │       ├── categories/route.ts
│   │       ├── review/route.ts
│   │       ├── stats/route.ts
│   │       └── jisho/route.ts  # Jisho.org proxy
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client (Turso adapter)
│   │   └── srs.ts              # SM-2 algorithm
│   └── components/ui/          # shadcn/ui components
├── data/                       # CSV/JSON source data
└── package.json
```

---

## 🌐 Deployment

### Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add environment variables:
   - `DATABASE_URL` — your Turso database URL
   - `TURSO_AUTH_TOKEN` — your Turso auth token
4. Deploy! 🎉

### Deploy to Cloudflare

This project can also run on Cloudflare Pages + D1. Update the Prisma adapter and database URL accordingly.

---

## 📚 Data Sources

- **JLPT Vocabulary**: [jamsinclair/open-anki-jlpt-decks](https://github.com/jamsinclair/open-anki-jlpt-decks) — CC0
- **Minna no Nihongo**: [Tohoku University](https://www.astr.tohoku.ac.jp/~akhlaghi/blog/JapaneseVocab.html)
- **Jisho API**: [Jisho.org](https://jisho.org) — 日本語辞書

---

## 📄 License

MIT
