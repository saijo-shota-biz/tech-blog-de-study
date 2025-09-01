# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack at http://localhost:3000
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server

### Code Quality
- `npm run lint` - Run Biome linter to check code quality
- `npm run format` - Auto-format code with Biome

## Architecture

This is a **Tech Blog Study** application - a Japanese language learning platform focused on English technical articles. It's built with Next.js 15 and integrates with external APIs and Firebase.

### Core Technologies
- **Next.js 15** with App Router architecture
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **Biome** for linting and formatting (replaces ESLint/Prettier)
- **Turbopack** for faster development builds
- **Firebase** for authentication and data storage
- **OpenAI API** for content analysis and translation

### Application Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/types/` - TypeScript type definitions for articles, analysis results, and API responses
- `src/lib/` - Firebase configuration and shared utilities
- `src/utils/` - Utility functions (sentence splitting, etc.)

### Key Features
- **Article Aggregation**: Fetches articles from Dev.to API and transforms them into unified format
- **Content Analysis**: Uses OpenAI API to provide Japanese translations, vocabulary explanations, and reading assistance
- **Text-to-Speech**: Converts English text to speech for pronunciation learning
- **Progress Tracking**: User reading progress and vocabulary learning via Firebase

### Data Flow
1. `/api/articles` - Fetches and transforms articles from Dev.to API
2. `/api/articles/[id]` - Retrieves individual article content
3. `/api/analyze` - Analyzes text paragraphs with OpenAI for learning assistance
4. `/api/tts` - Generates speech audio from text

### Key Conventions
- Path alias `@/*` maps to `./src/*`
- Strict TypeScript mode enabled
- Biome configured with Next.js and React specific rules
- 2-space indentation
- Font optimization using Geist font family
- Image optimization configured for Dev.to CDN domains