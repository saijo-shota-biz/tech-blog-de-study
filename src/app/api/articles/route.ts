import { NextResponse } from "next/server";
import type { Article, DevToArticle } from "@/types";

const DEV_TO_API_BASE = "https://dev.to/api";

function transformDevToArticle(devtoArticle: DevToArticle): Article {
  return {
    id: `devto-${devtoArticle.id}`,
    source: "devto",
    sourceId: devtoArticle.id.toString(),
    title: devtoArticle.title,
    description: devtoArticle.description,
    content: devtoArticle.body_html || "",
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";
  const tag = searchParams.get("tag");

  try {
    let url = `${DEV_TO_API_BASE}/articles?page=${page}&per_page=${perPage}`;
    if (tag) {
      url += `&tag=${tag}`;
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Dev.to API error: ${response.status}`);
    }

    const devtoArticles: DevToArticle[] = await response.json();
    const articles: Article[] = devtoArticles.map(transformDevToArticle);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}
