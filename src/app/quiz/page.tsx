"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

export default function QuizPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mode, setMode] = useState<"kanji" | "kana" | "meaning">("meaning");
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [started, setStarted] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [typingAnswer, setTypingAnswer] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const startQuiz = async () => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== "all") {
      params.set("categoryId", selectedCategory);
    }
    params.set("limit", "200");

    const res = await fetch(`/api/words?${params}`);
    const data = await res.json();

    const shuffled = [...data.words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTotal(0);
    setStarted(true);
    setDone(false);
    generateOptions(shuffled, 0);
  };

  const generateOptions = (allWords: Word[], index: number) => {
    const current = allWords[index];
    if (!current) return;

    if (!typingMode) {
      const wrong = allWords
        .filter((w) => w.id !== current.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allOptions = [current, ...wrong].sort(() => Math.random() - 0.5);

      if (mode === "kanji") {
        setOptions(allOptions.map((w) => w.kanji || w.kana));
      } else if (mode === "kana") {
        setOptions(allOptions.map((w) => w.kana));
      } else {
        setOptions(allOptions.map((w) => w.meaning));
      }
    }
    setSelectedAnswer(null);
    setCorrect(null);
    setTypingAnswer("");
  };

  const handleAnswer = (answer: string) => {
    const current = words[currentIndex];
    if (!current) return;

    const isCorrect = mode === "kanji"
      ? answer === (current.kanji || current.kana)
      : mode === "kana"
        ? answer === current.kana
        : answer === current.meaning;

    setSelectedAnswer(answer);
    setCorrect(isCorrect);
    setScore((s) => s + (isCorrect ? 1 : 0));
    setTotal((t) => t + 1);

    fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: current.id, quality: isCorrect ? 5 : 1 }),
    });
  };

  const handleTypingSubmit = () => {
    const current = words[currentIndex];
    if (!current) return;

    const isCorrect = typingAnswer.trim().toLowerCase() === current.meaning.toLowerCase();
    setCorrect(isCorrect);
    setScore((s) => s + (isCorrect ? 1 : 0));
    setTotal((t) => t + 1);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < words.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      generateOptions(words, nextIdx);
    } else {
      setDone(true);
    }
  };

  if (!started) {
    return (
      <div className="space-y-6 max-w-lg mx-auto pt-12">
        <h1 className="text-2xl font-bold text-center">Quiz</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meaning">See kanji → choose meaning</SelectItem>
                  <SelectItem value="kanji">See meaning → choose kanji</SelectItem>
                  <SelectItem value="kana">See meaning → choose reading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Typing mode</label>
              <input type="checkbox" checked={typingMode} onChange={(e) => setTypingMode(e.target.checked)} />
            </div>
            <Button className="w-full" onClick={startQuiz} disabled={!selectedCategory}>
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6 max-w-lg mx-auto pt-12 text-center">
        <h1 className="text-2xl font-bold">Quiz Complete!</h1>
        <p className="text-4xl font-bold">{score}/{total}</p>
        <p className="text-muted-foreground">
          Accuracy: {total > 0 ? Math.round((score / total) * 100) : 0}%
        </p>
        <Button onClick={() => setStarted(false)}>Back to Setup</Button>
      </div>
    );
  }

  const word = words[currentIndex];

  return (
    <div className="space-y-6 max-w-lg mx-auto pt-12">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {words.length}</span>
        <span>Score: {score}/{total}</span>
      </div>

      <Card className="min-h-[150px] flex items-center justify-center">
        <CardContent className="text-center p-8">
          <p className="text-3xl font-bold">
            {mode === "kanji" ? word.meaning : word.kanji || word.kana}
          </p>
          {mode === "kanji" && word.kanji && (
            <p className="text-lg text-muted-foreground mt-2">{word.kana}</p>
          )}
        </CardContent>
      </Card>

      {typingMode ? (
        <div className="space-y-2">
          <Input
            placeholder="Type the meaning..."
            value={typingAnswer}
            onChange={(e) => setTypingAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !correct && handleTypingSubmit()}
          />
          {!correct && <Button className="w-full" onClick={handleTypingSubmit}>Submit</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt, i) => (
            <Button
              key={i}
              variant={selectedAnswer === opt ? (correct ? "default" : "destructive") : "outline"}
              className="h-16 text-sm"
              disabled={correct !== null}
              onClick={() => handleAnswer(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      )}

      {correct !== null && (
        <div className="text-center space-y-2">
          <p className={correct ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
            {correct ? "Correct!" : "Incorrect"}
          </p>
          {!correct && (
            <p className="text-sm text-muted-foreground">
              Correct answer: {mode === "kanji" ? (word.kanji || word.kana) : mode === "kana" ? word.kana : word.meaning}
            </p>
          )}
          <Button onClick={nextQuestion}>Next</Button>
        </div>
      )}
    </div>
  );
}
