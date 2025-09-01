"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import type { AnalysisResult, Article } from "@/types";
import { splitIntoSentences } from "@/utils/sentenceSplitter";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  useEffect(() => {
    fetchArticle();
  }, [resolvedParams.id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${resolvedParams.id}`);
      if (!response.ok) throw new Error("Failed to fetch article");

      const data = await response.json();
      setArticle(data.article);

      // Parse and split content into sentences using utility
      const sentenceArray = splitIntoSentences(data.article.content);
      setSentences(sentenceArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSentenceClick = async (sentence: string) => {
    setSelectedSentence(sentence);
    setShowBottomSheet(true);

    try {
      setAnalyzing(true);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sentence }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze sentence");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error analyzing sentence:", error);
      setAnalysis({
        translation: "解析に失敗しました。",
        words: [],
        idioms: [],
        grammar: [],
        explanation: "エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!selectedSentence) return;

    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      if (isPlaying) {
        setIsPlaying(false);
        return;
      }

      setIsPlaying(true);

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: selectedSentence }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Article not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 p-1"
            aria-label="Back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {article.title}
            </h1>
            <p className="text-xs text-gray-600">{article.author.name}</p>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
          {article.author.profileImage && (
            <img
              src={article.author.profileImage}
              alt={article.author.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span>{article.author.name}</span>
          <span>•</span>
          <span>{article.readingTime} min read</span>
        </div>

        {/* Sentences */}
        <div className="prose prose-sm max-w-none">
          {sentences.map((sentence, index) => (
            <span
              key={index}
              onClick={() => handleSentenceClick(sentence)}
              className={`cursor-pointer transition-colors p-1 rounded inline ${
                selectedSentence === sentence
                  ? "bg-blue-200 text-blue-900"
                  : "hover:bg-blue-50"
              }`}
            >
              {sentence}{" "}
            </span>
          ))}
        </div>
      </main>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[50vh] overflow-y-auto z-50 shadow-lg border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto"></div>
            <button
              type="button"
              onClick={() => {
                setShowBottomSheet(false);
                setSelectedSentence(null);
                setAnalysis(null);
              }}
              className="text-gray-400 hover:text-gray-600"
              aria-label="閉じる"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">選択した文：</h3>
              <button
                type="button"
                onClick={handlePlayAudio}
                disabled={!selectedSentence}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:bg-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isPlaying ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 005.656 0M9 9a3 3 0 015.196 0M9 9a3 3 0 011.828-2.828M9 9v.01M15 9v.01"
                    />
                  )}
                </svg>
                <span>{isPlaying ? "停止" : "発音"}</span>
              </button>
            </div>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">
              {selectedSentence}
            </p>
          </div>

          {analyzing ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : analysis ? (
            <>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">日本語訳：</h4>
                <p className="text-gray-700">{analysis.translation}</p>
              </div>

              {analysis.words.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">単語：</h4>
                  <div className="space-y-2">
                    {analysis.words.map((word, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{word.word}</span>
                        <span className="text-gray-600">{word.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.grammar.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">文法：</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {analysis.grammar.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.explanation && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">解説：</h4>
                  <p className="text-sm text-gray-700">
                    {analysis.explanation}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
