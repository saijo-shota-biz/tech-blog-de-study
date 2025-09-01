"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import type { AnalysisResult, Article } from "@/types";
import { processHtmlWithClickableParagraphs } from "@/utils/sentenceSplitter";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedHtml, setProcessedHtml] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [selectedParagraph, setSelectedParagraph] = useState<string | null>(
    null,
  );
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${resolvedParams.id}`);
      if (!response.ok) throw new Error("Failed to fetch article");

      const data = await response.json();
      setArticle(data.article);

      // Store original content and process it
      setOriginalContent(data.article.content);

      // Initial processing without selected sentence
      const htmlContent = processHtmlWithClickableParagraphs(
        data.article.content,
      );
      setProcessedHtml(htmlContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Update processed HTML when selectedParagraph changes
  useEffect(() => {
    if (originalContent) {
      const htmlContent = processHtmlWithClickableParagraphs(
        originalContent,
        selectedParagraph || undefined,
      );
      setProcessedHtml(htmlContent);
    }
  }, [selectedParagraph, originalContent]);

  const handleSentenceClick = async (sentence: string) => {
    setSelectedParagraph(sentence);
    setShowBottomSheet(true);
    setBottomSheetExpanded(false);

    try {
      setAnalyzing(true);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paragraph: sentence }),
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
        vocab: [],
        phrases: [],
        entities: [],
        explanation: "エラーが発生しました。もう一度お試しください。",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!selectedParagraph) return;

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
        body: JSON.stringify({ text: selectedParagraph }),
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

  const handleBottomSheetToggle = () => {
    if (!bottomSheetExpanded) {
      // 50% -> 100%
      setBottomSheetExpanded(true);
    } else {
      // 100% -> 閉じる
      setShowBottomSheet(false);
      setSelectedParagraph(null);
      setAnalysis(null);
      setBottomSheetExpanded(false);
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
            type="button"
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
              <title>戻る</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900 break-words leading-tight">
              {article.title}
            </h1>
            <p className="text-xs text-gray-600">{article.author.name}</p>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto overflow-hidden">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            width={800}
            height={192}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-4 break-words hyphens-auto">
          {article.title}
        </h1>

        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
          {article.author.profileImage && (
            <Image
              src={article.author.profileImage}
              alt={article.author.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span>{article.author.name}</span>
          <span>•</span>
          <span>{article.readingTime} min read</span>
        </div>

        {/* Article Content with Clickable Sentences */}
        <article
          className="prose prose-sm max-w-none break-words overflow-wrap-anywhere"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is from trusted dev.to API and processed
          dangerouslySetInnerHTML={{ __html: processedHtml }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("clickable-paragraph")) {
              const sentence = target.getAttribute("data-sentence");
              if (sentence) {
                handleSentenceClick(sentence);
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const target = e.target as HTMLElement;
              if (target.classList.contains("clickable-paragraph")) {
                const sentence = target.getAttribute("data-sentence");
                if (sentence) {
                  handleSentenceClick(sentence);
                }
              }
            }
          }}
        />
      </main>

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 overflow-y-auto z-50 shadow-lg border-t border-gray-200 transition-all duration-300 ${
            bottomSheetExpanded ? "h-[90vh]" : "h-[50vh]"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              className="w-12 h-1 bg-gray-300 rounded-full mx-auto cursor-pointer hover:bg-gray-400 transition-colors border-none p-2 -m-2"
              onClick={handleBottomSheetToggle}
              aria-label={
                bottomSheetExpanded
                  ? "ボトムシートを閉じる"
                  : "ボトムシートを展開"
              }
            />
            <button
              type="button"
              onClick={() => {
                setShowBottomSheet(false);
                setSelectedParagraph(null);
                setAnalysis(null);
                setBottomSheetExpanded(false);
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
                <title>閉じる</title>
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
                disabled={!selectedParagraph}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:bg-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>{isPlaying ? "停止" : "発音"}</title>
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
              {selectedParagraph}
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

              {analysis.vocab.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    重要単語：
                  </h4>
                  <div className="space-y-2">
                    {analysis.vocab.map((item) => (
                      <div
                        key={item.term}
                        className="bg-gray-50 p-2 rounded text-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-blue-700">
                            {item.term}
                          </span>
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">
                            {item.type}
                          </span>
                        </div>
                        <div className="text-gray-700">{item.meaning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.phrases.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    重要表現：
                  </h4>
                  <div className="space-y-2">
                    {analysis.phrases.map((item) => (
                      <div
                        key={item.phrase}
                        className="bg-blue-50 p-2 rounded text-sm"
                      >
                        <div className="font-medium text-blue-800 mb-1">
                          {item.phrase}
                        </div>
                        <div className="text-gray-700 mb-1">{item.meaning}</div>
                        {item.note && (
                          <div className="text-xs text-gray-600 italic">
                            {item.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.entities.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    専門用語・固有名詞：
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.entities.map((entity) => (
                      <span
                        key={entity}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                      >
                        {entity}
                      </span>
                    ))}
                  </div>
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
