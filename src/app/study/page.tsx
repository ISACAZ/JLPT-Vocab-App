"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: number;
  name: string;
  type: string;
}

interface Word {
  id: number;
  kanji: string;
  kana: string;
  meaning: string;
  jlptLevel: string;
}

export default function StudyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const startSession = async () => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.set("categoryId", selectedCategory);
    }
    params.set("limit", "100");

    const res = await fetch(`/api/words?${params}`);
    const data = await res.json();

    const shuffled = [...data.words].sort(() => Math.random() - 0.5);
    setSessionWords(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
    setStarted(true);
    setDone(false);
  };

  const handleReview = async (quality: number) => {
    if (!sessionWords[currentIndex]) return;

    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: sessionWords[currentIndex].id, quality }),
    });

    if (currentIndex + 1 < sessionWords.length) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      setDone(true);
    }
  };

  if (!started) {
    return (
      <div className="space-y-6 max-w-lg mx-auto pt-12">
        <h1 className="text-2xl font-bold text-center">Study</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">Select a category to start studying</p>
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Choose category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={startSession} disabled={!selectedCategory}>
              Start Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6 max-w-lg mx-auto pt-12 text-center">
        <h1 className="text-2xl font-bold">Session Complete!</h1>
        <p className="text-muted-foreground">
          You reviewed {sessionWords.length} words.
        </p>
        <Button onClick={() => setStarted(false)}>Back to Categories</Button>
      </div>
    );
  }

  const word = sessionWords[currentIndex];
  if (!word) return null;

  return (
    <div className="space-y-6 max-w-lg mx-auto pt-12">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {sessionWords.length}</span>
        {word.jlptLevel && <Badge variant="secondary">JLPT {word.jlptLevel}</Badge>}
      </div>

      <div
        className="cursor-pointer select-none"
        onClick={() => setFlipped(!flipped)}
      >
        <Card className="min-h-[250px] flex items-center justify-center">
          <CardContent className="text-center p-8">
            {!flipped ? (
              <>
                <p className="text-4xl font-bold mb-2">{word.kanji || word.kana}</p>
                {word.kanji && <p className="text-xl text-muted-foreground">{word.kana}</p>}
              </>
            ) : (
              <>
                <p className="text-2xl font-bold mb-2">{word.meaning}</p>
                {word.kanji && <p className="text-lg text-muted-foreground">{word.kanji}</p>}
                <p className="text-lg text-muted-foreground">{word.kana}</p>
              </>
            )}
            <p className="text-xs text-muted-foreground mt-4">Click to flip</p>
          </CardContent>
        </Card>
      </div>

      {flipped && (
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" className="h-16 text-sm" onClick={() => handleReview(1)}>
            🔄 Again
          </Button>
          <Button variant="outline" className="h-16 text-sm" onClick={() => handleReview(3)}>
            🤔 Hard
          </Button>
          <Button className="h-16 text-sm" onClick={() => handleReview(5)}>
            ✅ Easy
          </Button>
        </div>
      )}
    </div>
  );
}
