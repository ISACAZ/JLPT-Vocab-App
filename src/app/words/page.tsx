"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  id: number;
  name: string;
  type: string;
}

interface WordCategory {
  category: Category;
}

interface Word {
  id: number;
  kanji: string;
  kana: string;
  meaning: string;
  jlptLevel: string;
  source: string;
  categories: WordCategory[];
}

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [jlptLevel, setJlptLevel] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (jlptLevel) params.set("jlptLevel", jlptLevel);
    if (source) params.set("source", source);
    params.set("page", String(page));
    params.set("limit", "50");

    const res = await fetch(`/api/words?${params}`);
    const data = await res.json();
    setWords(data.words);
    setTotal(data.total);
    setLoading(false);
  }, [search, jlptLevel, source, page]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Words</h1>

      <div className="flex gap-2 flex-wrap">
        <Input
          placeholder="Search kanji, kana, or meaning..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
        <Select value={jlptLevel} onValueChange={(v) => { setJlptLevel(v ?? ""); setPage(1); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="JLPT Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="N5">N5</SelectItem>
            <SelectItem value="N4">N4</SelectItem>
            <SelectItem value="N3">N3</SelectItem>
            <SelectItem value="N2">N2</SelectItem>
            <SelectItem value="N1">N1</SelectItem>
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={(v) => { setSource(v ?? ""); setPage(1); }}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="jlpt">JLPT</SelectItem>
            <SelectItem value="minna">Minna no Nihongo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{total} words found</p>
          <div className="grid gap-2">
            {words.map((w) => (
              <Card key={w.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-lg font-japanese">{w.kanji || w.kana}</p>
                      <p className="text-sm text-muted-foreground">
                        {w.kanji && <span>{w.kana}</span>}
                        {w.kanji && w.kana && " · "}
                        <span>{w.meaning}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {w.jlptLevel && <Badge variant="secondary">JLPT {w.jlptLevel}</Badge>}
                    <Badge variant="outline">{w.source}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
