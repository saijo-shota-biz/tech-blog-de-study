# Tech Blog Study - 英語×技術学習

英語の技術記事を使った日本語学習プラットフォームです。Dev.toから記事を取得し、AI分析による翻訳・語彙解説・音声読み上げ機能を提供します。

## 主な機能

- 📚 **技術記事の取得**: Dev.to APIから最新の技術記事を自動取得
- 🤖 **AI翻訳・解説**: OpenAI APIによる自然な日本語翻訳と語彙解説
- 🔊 **音声読み上げ**: 英語発音学習のためのText-to-Speech機能
- 📊 **学習進捗管理**: Firebase連携による読書進捗とボキャブラリー管理

## 技術スタック

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Firebase (Firestore)
- **AI**: OpenAI API
- **External API**: Dev.to API
- **Dev Tools**: Biome (Linter/Formatter) + Turbopack

## 開発環境のセットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-your_measurement_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 利用可能なコマンド

```bash
# 開発
npm run dev      # 開発サーバー起動（Turbopack使用）
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動

# コード品質
npm run lint     # Biomeでコード品質チェック
npm run format   # Biomeでコード自動整形
```

## プロジェクト構成

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   │   ├── articles/   # 記事取得API
│   │   ├── analyze/    # AI分析API
│   │   └── tts/        # 音声生成API
│   ├── article/        # 記事詳細ページ
│   └── page.tsx        # ホームページ
├── lib/                # Firebase設定
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
```

## API エンドポイント

- `GET /api/articles` - Dev.toから記事一覧を取得
- `GET /api/articles/[id]` - 特定記事の詳細を取得
- `POST /api/analyze` - テキストのAI分析（翻訳・語彙解説）
- `POST /api/tts` - テキストの音声生成
