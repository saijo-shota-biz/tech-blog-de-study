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

This is a Next.js 15 application using:
- **React 19** with TypeScript
- **App Router** architecture (files in `src/app/`)
- **Tailwind CSS v4** for styling
- **Biome** for linting and formatting (replaces ESLint/Prettier)
- **Turbopack** for faster development builds

### Key Conventions
- Path alias `@/*` maps to `./src/*`
- Strict TypeScript mode enabled
- Biome configured with Next.js and React specific rules
- 2-space indentation
- Font optimization using Geist font family