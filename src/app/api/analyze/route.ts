import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { AnalysisResult } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { sentence } = await request.json();

    if (!sentence) {
      return NextResponse.json(
        { error: "Sentence is required" },
        { status: 400 }
      );
    }

    const prompt = `
以下の英文を解析してください：
"${sentence}"

記事のコンテキスト：技術ブログ（プログラミング関連）

以下の形式でJSONを返してください：
{
  "translation": "日本語訳",
  "words": [
    {
      "word": "単語",
      "meaning": "意味",
      "type": "品詞",
      "techTerm": true/false
    }
  ],
  "idioms": ["イディオムや句動詞のリスト"],
  "grammar": ["使われている文法のポイント"],
  "explanation": "この文を理解するための補足説明"
}

重要：
- 技術用語は techTerm: true にしてください
- 初心者にもわかりやすい説明をしてください
- JSONのみを返し、他の説明は不要です
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid response format from OpenAI");
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing sentence:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentence" },
      { status: 500 }
    );
  }
}