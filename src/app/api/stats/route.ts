import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const totalWords = await prisma.word.count();

  const categories = await prisma.category.findMany({
    include: { words: true },
  });

  const reviewedWords = await prisma.reviewLog.groupBy({
    by: ["wordId"],
    _count: true,
  });

  const totalReviews = await prisma.reviewLog.count();
  const wordsWithReviews = reviewedWords.length;

  const quizResults = await prisma.quizResult.findMany();
  const correctQuiz = quizResults.filter((r) => r.correct).length;

  const now = new Date();
  const dueCount = await prisma.reviewLog.count({
    where: { nextReviewDate: { lte: now } },
  });

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentReviews = await prisma.reviewLog.count({
    where: { createdAt: { gte: last7Days } },
  });

  return NextResponse.json({
    totalWords,
    totalCategories: categories.length,
    wordsWithReviews,
    totalReviews,
    correctQuiz,
    totalQuiz: quizResults.length,
    quizAccuracy: quizResults.length > 0 ? Math.round((correctQuiz / quizResults.length) * 100) : 0,
    dueCount,
    recentReviews,
  });
}
