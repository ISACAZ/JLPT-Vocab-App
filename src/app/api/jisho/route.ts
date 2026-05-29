import { NextRequest, NextResponse } from "next/server";

const JISHO_API = "https://jisho.org/api/v1/search/words";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");

  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${JISHO_API}?keyword=${encodeURIComponent(keyword)}`, {
      headers: { "User-Agent": "VocabJP/1.0" },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from Jisho" }, { status: 502 });
  }
}
