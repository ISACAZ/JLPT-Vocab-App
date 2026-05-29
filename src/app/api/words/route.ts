import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId");
  const jlptLevel = searchParams.get("jlptLevel");
  const source = searchParams.get("source");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { kanji: { contains: search } },
      { kana: { contains: search } },
      { meaning: { contains: search } },
    ];
  }
  if (jlptLevel) where.jlptLevel = jlptLevel;
  if (source) where.source = source;
  if (categoryId) {
    where.categories = { some: { categoryId: parseInt(categoryId) } };
  }

  const [words, total] = await Promise.all([
    prisma.word.findMany({
      where,
      skip,
      take: limit,
      include: { categories: { include: { category: true } } },
      orderBy: { id: "asc" },
    }),
    prisma.word.count({ where }),
  ]);

  return NextResponse.json({ words, total, page, totalPages: Math.ceil(total / limit) });
}
