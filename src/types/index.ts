// Dev.to API types
export interface DevToArticle {
  id: number;
  title: string;
  description: string;
  readable_publish_date: string;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  collection_id: number | null;
  published_timestamp: string;
  positive_reactions_count: number;
  cover_image: string | null;
  social_image: string;
  canonical_url: string;
  created_at: string;
  edited_at: string | null;
  crossposted_at: string | null;
  published_at: string;
  last_comment_at: string;
  reading_time_minutes: number;
  tag_list: string[];
  tags: string;
  user: {
    name: string;
    username: string;
    twitter_username: string | null;
    github_username: string | null;
    website_url: string | null;
    profile_image: string;
    profile_image_90: string;
  };
  body_html?: string;
  body_markdown?: string;
}

// Application types
export interface Article {
  id: string;
  source: "devto" | "medium" | "hashnode";
  sourceId: string;
  title: string;
  description: string;
  content: string;
  author: {
    name: string;
    username: string;
    profileImage?: string;
  };
  publishedAt: string;
  readingTime: number;
  tags: string[];
  url: string;
  coverImage?: string;
}

export interface Sentence {
  id: string;
  text: string;
  position: number;
  articleId: string;
}

export interface AnalysisResult {
  translation: string; // 段落全体の自然な和訳
  vocab: Array<{ term: string; meaning: string; type: string }>; // 非専門の重要語のみ
  phrases: Array<{ phrase: string; meaning: string; note?: string }>; // 句動詞・コロケーション・定型表現など
  entities: string[]; // 専門用語・製品名・略語（訳さない）
  explanation: string; // 段落の要旨・読み解きのコツ
}

export interface UserProgress {
  userId: string;
  articleId: string;
  sentencesRead: number[];
  completedAt?: Date;
  readingTime: number;
}

export interface Vocabulary {
  userId: string;
  word: string;
  contexts: string[];
  savedAt: Date;
  reviewCount: number;
  lastReviewedAt?: Date;
}
