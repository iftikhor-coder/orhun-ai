# Frontend setup (Next.js + Tailwind + Supabase)

Bu papkada Next.js loyihasi turadi. Birinchi marta sozlash uchun:

## 1) Loyihani yaratish (kompyuteringizda)

```bash
cd orhun-ai/
# frontend papkasini o'chirib qaytadan yarating
rm -rf frontend
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint
cd frontend
```

## 2) Kerakli paketlar

```bash
npm install @supabase/supabase-js @supabase/ssr next-intl howler zustand lucide-react clsx tailwind-merge
npm install -D @types/howler
```

## 3) shadcn/ui

```bash
npx shadcn@latest init
```

Tanlovlar:
- Style: **New York**
- Base color: **Slate**
- CSS variables: **Yes**

Boshlang'ich komponentlar:
```bash
npx shadcn@latest add button input label card dialog dropdown-menu toast avatar
```

## 4) Environment variables

`frontend/.env.local` yarating:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_BACKEND_URL=http://YOUR-ORACLE-IP:8000
```

## 5) Test ishga tushirish

```bash
npm run dev
```

http://localhost:3000 ochiladi → "Hello, Next.js!" ko'rinishi kerak.

## 6) Vercel'ga deploy

1. GitHub'ga push qiling
2. vercel.com → New Project → orhun-ai repo
3. **Root Directory: `frontend`** ⚠️
4. Environment Variables qo'shing (yuqoridagi 3 ta)
5. Deploy

## Keyingi qadamlar

Hafta 2'da men quyidagilarni tayyorlayman:
- `app/[locale]/layout.tsx` — root layout
- `lib/supabase/client.ts` — Supabase client
- `lib/supabase/server.ts` — server-side Supabase
- `middleware.ts` — auth + i18n routing
- `messages/en.json, uz.json, az.json, tr.json` — tarjimalar
- `app/[locale]/login/page.tsx` — login UI
- `app/[locale]/onboarding/...` — 3 ta onboarding ekran

Bularni Hafta 1 fundament tayyor bo'lgandan keyin yozaman.
