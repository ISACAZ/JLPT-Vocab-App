"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Stats {
  totalWords: number;
  totalCategories: number;
  wordsWithReviews: number;
  totalReviews: number;
  correctQuiz: number;
  totalQuiz: number;
  quizAccuracy: number;
  dueCount: number;
  recentReviews: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <p className="text-muted-foreground">Loading...</p>;

  const reviewRate = stats.totalWords > 0 ? Math.round((stats.wordsWithReviews / stats.totalWords) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistics</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Words Studied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.wordsWithReviews} / {stats.totalWords}</p>
            <Progress value={reviewRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{reviewRate}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalReviews}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.recentReviews} in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Quiz Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.quizAccuracy}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.correctQuiz} / {stats.totalQuiz} correct
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Due for review</span>
                <span className="font-bold text-orange-500">{stats.dueCount}</span>
              </div>
              <Progress value={stats.totalWords > 0 ? (stats.dueCount / stats.totalWords) * 100 : 0} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Reviewed (all time)</span>
                <span className="font-bold">{stats.wordsWithReviews}</span>
              </div>
              <Progress value={reviewRate} />
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        {stats.totalCategories} categories · {stats.totalWords} total words
      </p>
    </div>
  );
}
