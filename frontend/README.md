# Orhun AI — Frontend

Next.js 14 + Tailwind + Supabase + i18n (4 languages)

## Setup

```bash
npm install
cp .env.local.example .env.local
# Filled .env.local with Supabase keys
npm run dev
```

`http://localhost:3000` will open.

## Vercell deploy

1. Push status to GitHub
2. Connected in Vercel
3. Root Directory: `frontend`
4. Environment Variables: 
- `NEXT_PUBLIC_SUPABASE_URL` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Structure

```
frontend/
├── app/
│ ├── [locale]/ # i18n routes (en/uz/az/tr)
│ │ ├── login/ ✅ Ready
│ │ ├── onboarding/ ⚙️ Skeleton (Week 2)
│ │ ├── home/ ⚙️ Skeleton (Week 3)
│ │ ├── create/ ⚙️ Skeleton (Week 3)
│ │ └── explore/ ⚙️ Skeleton (Week 5)
│ ├── globals.css # Orhun theme
│ └── layout.tsx
├── components/
│ ├── logo.tsx # Brand logo
│ └── language-switcher.tsx
├── lib/
│ ├── supabase/ # Supabase clients
│ └── utils.ts
├── messages/ # 4 language translations
│ ├── en.json
│ ├── en.json
│ ├── en.json
│ └── tr.json
├── i18n/
│ └── request.ts # next-intl config
└── middleware.ts # i18n routing

```
## Design

- **Theme:** Deep midnight blue + ancient Turkic gold
- **Fonts:** Cormorant Garamond (display) + Plus Jakarta Sans (body)
- **Style:** Inspired by the ancient Orhun stones
- **Language:** EN (default) + UZ + AZ + TR

## Next steps

- Week 2: Onboarding complete (DOB + Profile + Genres)
- Week 3: Create page + Modal API integration
- Week 4: Audio player
- Week 5: Explore + Like + Comment
