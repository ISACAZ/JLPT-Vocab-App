"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Stats {
  totalWords: number;
  totalCategories: number;
  wordsWithReviews: number;
  totalReviews: number;
  dueCount: number;
  recentReviews: number;
  quizAccuracy: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Words</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalWords ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Due for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{stats?.dueCount ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Reviews (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.recentReviews ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Quiz Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.quizAccuracy ?? "—"}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/study" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
              <p className="font-medium">📖 Start Studying</p>
              <p className="text-sm text-muted-foreground">SRS flashcards with spaced repetition</p>
            </Link>
            <Link href="/quiz" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
              <p className="font-medium">✍️ Take a Quiz</p>
              <p className="text-sm text-muted-foreground">Test your knowledge</p>
            </Link>
            <Link href="/words" className="block p-3 rounded-lg border hover:bg-muted transition-colors">
              <p className="font-medium">🔍 Browse Words</p>
              <p className="text-sm text-muted-foreground">Search and manage vocabulary</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["N5", "N4", "N3", "N2", "N1"].map((lvl) => (
                <Link key={lvl} href={`/words?jlptLevel=${lvl}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    JLPT {lvl}
                  </Badge>
                </Link>
              ))}
              {["Minna no Nihongo"].map((m) => (
                <Link key={m} href="/words?source=minna">
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80">
                    {m}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
