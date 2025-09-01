import { NextResponse } from "next/server";
import type { DevToArticle, Article } from "@/types";

const DEV_TO_API_BASE = "https://dev.to/api";

function transformDevToArticle(devtoArticle: DevToArticle): Article {
  return {
    id: `devto-${devtoArticle.id}`,
    source: "devto",
    sourceId: devtoArticle.id.toString(),
    title: devtoArticle.title,
    description: devtoArticle.description,
    content: devtoArticle.body_html || devtoArticle.body_markdown || "",
    author: {
      name: devtoArticle.user.name,
      username: devtoArticle.user.username,
      profileImage: devtoArticle.user.profile_image,
    },
    publishedAt: devtoArticle.published_at,
    readingTime: devtoArticle.reading_time_minutes,
    tags: devtoArticle.tag_list,
    url: devtoArticle.url,
    coverImage: devtoArticle.cover_image || undefined,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Extract the numeric ID from our composite ID (e.g., "devto-123" -> "123")
  const sourceId = id.replace("devto-", "");

  try {
    const response = await fetch(`${DEV_TO_API_BASE}/articles/${sourceId}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        );
      }
      throw new Error(`Dev.to API error: ${response.status}`);
    }

    const devtoArticle: DevToArticle = await response.json();
    const article: Article = transformDevToArticle(devtoArticle);

    return NextResponse.json({ article });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}