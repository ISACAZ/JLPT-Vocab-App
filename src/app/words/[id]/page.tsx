"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface JishoEntry {
  slug: string;
  japanese: { word?: string; reading: string }[];
  senses: { english_definitions: string[]; parts_of_speech: string[] }[];
}

interface Word {
  id: number;
  kanji: string;
  kana: string;
  meaning: string;
  jlptLevel: string;
  source: string;
}

export default function WordDetailPage() {
  const params = useParams();
  const [word, setWord] = useState<Word | null>(null);
  const [jishoData, setJishoData] = useState<JishoEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/words?search=${params.id}&limit=1`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.words?.length > 0) {
          setWord(data.words[0]);
          const res = await fetch(`/api/jisho?keyword=${encodeURIComponent(data.words[0].kanji || data.words[0].kana)}`);
          const jisho = await res.json();
          setJishoData(jisho.data || []);
        }
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!word) return <p>Word not found</p>;

  const entry = jishoData[0];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-8">
      <Link href="/words"><Button variant="ghost">← Back to Words</Button></Link>

      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-5xl font-bold mb-2">{word.kanji || word.kana}</p>
          {word.kanji && <p className="text-2xl text-muted-foreground mb-4">{word.kana}</p>}
          <p className="text-xl mb-4">{word.meaning}</p>
          <div className="flex justify-center gap-2">
            {word.jlptLevel && <Badge>JLPT {word.jlptLevel}</Badge>}
            <Badge variant="outline">{word.source}</Badge>
          </div>
        </CardContent>
      </Card>

      {entry && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Jisho Details</h3>
            {entry.senses?.map((sense, i) => (
              <div key={i} className="border-b pb-2 last:border-0">
                <div className="flex flex-wrap gap-1 mb-1">
                  {sense.parts_of_speech?.map((pos) => (
                    <Badge key={pos} variant="secondary" className="text-xs">{pos}</Badge>
                  ))}
                </div>
                <p>{sense.english_definitions?.join(", ")}</p>
              </div>
            ))}
            {entry.japanese?.length > 1 && (
              <div className="text-sm text-muted-foreground">
                <p>Other forms: {entry.japanese.map((j) => j.word || j.reading).join(", ")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 justify-center">
        <Link href={`/study`}><Button>Study This</Button></Link>
        <Link href={`/quiz`}><Button variant="outline">Quiz</Button></Link>
      </div>
    </div>
  );
}
