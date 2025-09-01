// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

/** 最終出力の型（UIで使う想定） */
export type AnalysisResult = {
  translation: string; // 段落全体の自然な和訳（1–2文）
  vocab: Array<{ term: string; meaning: string; type: string }>; // 非専門の重要語のみ
  phrases: Array<{ phrase: string; meaning: string; note?: string }>; // 句動詞・コロケ・定型・談話標識など（件数上限なし）
  entities: string[]; // 専門用語・製品名・略語（訳さない）
  explanation: string; // 段落の要旨・読み解きのコツ（1–2文）
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- プロンプト -------------------------------------------------------------

const SYSTEM_PROMPT = `
あなたは技術英語の読解アシスタント。入力は技術ブログの1段落（pタグ）。
出力は必ず **JSON オブジェクトのみ**（前置き・コードフェンス・コメントは禁止）。

目的：
- 学習者が段落を正しく理解するために必要な「知識の壁」になり得る表現を **漏れなく抽出** する。

方針：
- 専門用語（製品名・フレームワーク名・API名・プロトコル・略語など）は **訳さない／解説しない**。vocab から除外し、"entities" に列挙のみ。
- vocab は **非専門の重要語** に限定（abstract, streamline, counterpart, full-fledged, nuance など）。基礎語（get/make/use/do など）や極端に易しい語は除外。
- phrases は **理解に必要なあらゆる“まとまり”** を含む。件数上限を設けない。重要度順に多めに列挙する。
  含める対象の例：
  - 句動詞：set out to, turn out to, work together to
  - 慣用句・定型表現：from the ground up, read on, at scale
  - コロケーション：pick the right tools, layer A with B, streamline A from X to Y, build a full-fledged site
  - 準専門の形容表現：AI-powered, production-ready, developer-friendly
  - 談話標識・文頭句：In this article, By doing so, If you're curious …
  - ライトバーブ構文：make trade-offs, take advantage of
- translation は段落全体の自然な和訳。
- explanation は段落の要旨や読み解きのコツを **1–2文**。

厳守：
- JSONのみ。末尾カンマ禁止。
- phrases は **「その知識がないと読めない」ものを優先**。該当が多い場合は重要度順でできるだけ多く出す。
`.trim();

const userPrompt = (paragraph: string) =>
  `
段落:
${paragraph}

出力フォーマット:
{
  "translation": "...",
  "vocab": [
    { "term": "...", "meaning": "...", "type": "名詞|動詞|形容詞 等" }
  ],
  "phrases": [
    { "phrase": "...", "meaning": "...", "note": "..." }
  ],
  "entities": ["...", "..."],
  "explanation": "..."
}
`.trim();

// ---- ユーティリティ ---------------------------------------------------------

const stripCodeFences = (s: string) =>
  s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

// ---- ルート実装 -------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // 互換のため { sentence } でも受ける
    const body = await request.json().catch(() => ({}));
    const paragraph: string = body.paragraph ?? body.sentence;

    if (!paragraph) {
      return NextResponse.json(
        { error: "Paragraph is required" },
        { status: 400 },
      );
    }

    // OpenAI 呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" }, // JSONを強制
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt(paragraph) },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonText = stripCodeFences(raw);
    const analysis = JSON.parse(jsonText) as AnalysisResult;
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing paragraph:", error);
    return NextResponse.json(
      { error: "Failed to analyze paragraph" },
      { status: 500 },
    );
  }
}
