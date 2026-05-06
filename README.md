# 🎵 Orhun AI

AI music generation platform — Suno-ga o'xshash, lekin 4 tilda (UZ/AZ/TR/EN).

**Live:** [orhun-ai.vercel.app](https://orhun-ai.vercel.app)

## Arxitektura

```
[Vercel Frontend (Next.js)]  ←→  [Supabase (DB + Auth + Storage)]
         ↓
[Oracle Backend (FastAPI)]
         ↓
[HuggingFace Space (ACE-Step 1.5)]
```

## Repo strukturasi

```
orhun-ai/
├── docs/                 — Hujjatlar va qadamlar
├── supabase/             — DB schema + RLS policies + seed
├── huggingface-space/    — HF Space uchun fayllar (app.py)
├── frontend/             — Next.js sayt (Vercel'da)
├── backend/              — FastAPI backend (Oracle'da)
└── README.md             — Shu fayl
```

## Boshlash

`docs/HAFTA-1-QADAMLAR.md` ni o'qing va bosqichma-bosqich bajaring.

## Tech stack

- **Frontend:** Next.js 14, Tailwind, shadcn/ui, next-intl
- **Backend:** FastAPI (Python 3.11+)
- **Database:** Supabase (Postgres) + RLS
- **Auth:** Supabase Auth (Google OAuth)
- **AI Model:** ACE-Step 1.5 (Apache 2.0)
- **Hosting:** Vercel + Oracle ARM + HuggingFace Spaces
