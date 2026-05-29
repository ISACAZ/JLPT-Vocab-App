import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { wordId, quality } = await req.json();

  const word = await prisma.word.findUnique({ where: { id: wordId } });
  if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });

  const lastReview = await prisma.reviewLog.findFirst({
    where: { wordId },
    orderBy: { createdAt: "desc" },
  });

  let ease = 2.5;
  let interval = 0;
  let repetitions = 0;

  if (lastReview) {
    ease = lastReview.ease;
    interval = lastReview.interval;
    repetitions = lastReview.repetitions;
  }

  if (quality < 3) {
    repetitions = 0;
    interval = 0;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * ease);
    repetitions += 1;
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  const review = await prisma.reviewLog.create({
    data: {
      wordId,
      ease,
      interval,
      repetitions,
      nextReviewDate,
    },
  });

  return NextResponse.json(review);
}

export async function GET() {
  const now = new Date();
  const dueReviews = await prisma.reviewLog.findMany({
    where: { nextReviewDate: { lte: now } },
    include: { word: true },
    orderBy: { nextReviewDate: "asc" },
  });

  return NextResponse.json(dueReviews);
}
