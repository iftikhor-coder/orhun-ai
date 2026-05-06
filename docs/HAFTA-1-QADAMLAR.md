# ORHUN AI — HAFTA 1 QADAMLAR

Bu qo'llanma to'liq, **birinchi qadamdan oxirgisigacha**. Har bir qadam tartib bilan, nimalarni qayerda qilishingiz aniq yozilgan.

---

## ⚙️ AVVAL: Akkauntlar tayyorlash (~30 daqiqa)

Quyidagi xizmatlarda akkauntingiz bor bo'lishi kerak. Yo'q bo'lsa, hoziroq oching:

| # | Xizmat | URL | Nima uchun |
|---|--------|-----|------------|
| 1 | **GitHub** | github.com | Kod saqlash |
| 2 | **Vercel** | vercel.com | Frontend hosting (GitHub bilan ulang) |
| 3 | **Supabase** | supabase.com | Database + Auth |
| 4 | **HuggingFace** | huggingface.co | AI model GPU |
| 5 | **Google Cloud Console** | console.cloud.google.com | OAuth uchun |

**Eslatma:** Hammasi bepul. Kredit kartasiz boshlash mumkin.

---

## 📅 KUN 1 — Supabase + GitHub repo

### 1.1) GitHub'da repo yaratish

1. github.com → **New Repository**
2. Repository name: `orhun-ai`
3. Private yoki Public — sizning xohlishingizga
4. README.md, .gitignore (Node) tanlang
5. Create

**Sizning kompyuteringizda:**
```bash
git clone https://github.com/SIZNING-USERNAME/orhun-ai.git
cd orhun-ai
mkdir frontend backend supabase huggingface-space docs
```

### 1.2) Supabase loyihani yaratish

1. supabase.com → **Sign in with GitHub**
2. **New Project** tugmasini bosing
3. To'ldiring:
   - **Name:** `orhun-ai`
   - **Database Password:** Kuchli parol (saqlang!)
   - **Region:** Frankfurt yoki Mumbai (sizga yaqinroq)
   - **Pricing Plan:** Free
4. **Create new project** → 2 daqiqa kuting

### 1.3) Supabase'da schema yaratish

Loyiha tayyor bo'lganda:

1. Chap menyuda **SQL Editor** ni oching
2. **New Query** tugmasi
3. `supabase/01_schema.sql` faylidagi SQL kodni nusxalab joylashtiring
4. **Run** bosing → "Success" yashil yozuv chiqishi kerak
5. Yana **New Query** → `supabase/02_rls_policies.sql` ni Run qiling
6. Yana **New Query** → `supabase/03_seed_genres.sql` ni Run qiling

**Tekshirish:** Chap menyuda **Table Editor** → quyidagi jadvallar ko'rinishi kerak:
- profiles
- genres (ichida 12 ta janr)
- user_genres
- songs
- likes
- comments

### 1.4) Supabase API kalitlarini olish

1. Chap pastda **Project Settings** ⚙️
2. **API** bo'limi
3. Quyidagilarni `.env` fayliga saqlang (kompyuteringizda Notepad'da):
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...  (public key)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (DIQQAT: SIRLI! Hech qachon frontend'ga qo'ymang!)
   ```

### 1.5) Google OAuth sozlash

1. console.cloud.google.com → **New Project** → "Orhun AI"
2. Chap menyuda **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → Create
   - App name: `Orhun AI`
   - User support email: sizning email
   - Developer email: sizning email
   - Save and Continue (Scopes va Test users qoldiring → Save)
3. **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Orhun AI Web`
   - **Authorized redirect URIs** ga qo'shing:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
     (xxxxx — sizning Supabase URL'ingizdagi qism)
4. **Create** → Client ID va Client Secret ko'rinadi → saqlang

### 1.6) Supabase'da Google OAuth yoqish

1. Supabase → Authentication → **Providers**
2. **Google** ni toping → **Enable**
3. Yuqorida olgan **Client ID** va **Client Secret** ni kiriting
4. **Save**

✅ **Kun 1 tugadi!**

---

## 📅 KUN 2 — HuggingFace Space (ACE-Step deploy)

### 2.1) HuggingFace ro'yxatdan o'tish

1. huggingface.co → **Sign Up**
2. Email tasdiqlang
3. Profile → **Settings** → **Access Tokens** → **New token**
   - Name: `orhun-ai-backend`
   - Type: **Write**
   - Create → **TOKEN'NI NUSXALANG VA SAQLANG** (faqat 1 marta ko'rsatadi!)

### 2.2) ACE-Step Space yaratish

1. huggingface.co/new-space
2. To'ldiring:
   - **Owner:** sizning username
   - **Space name:** `orhun-acestep`
   - **License:** apache-2.0
   - **SDK:** Gradio
   - **Hardware:** **ZeroGPU** (bepul! agar ko'rinmasa CPU basic)
   - **Visibility:** **Public** (ZeroGPU faqat public'da bepul)
3. **Create Space**

### 2.3) Fayllarni yuklash

Space yaratilgach, **Files** tabga o'ting va quyidagi fayllarni yuklang:

1. **`app.py`** — `huggingface-space/app.py` faylimni yuklang
2. **`requirements.txt`** — `huggingface-space/requirements.txt` faylimni yuklang
3. **`README.md`** — Space metadata bilan (men tayyorlayman)

**Yuklash usuli:** "Add file" → "Upload files" → browser'dan tortib qo'ying

### 2.4) Space build kutish

- Yuqoriga **Logs** tabini oching
- 10-20 daqiqa kutish kerak (model yuklanadi)
- "Running" yashil status chiqsa — tayyor!
- Browser'da Gradio UI ko'rinadi → promt yozib test qiling

### 2.5) API endpoint'ni topish

Space ishlaganda:
1. UI tagida **"Use via API"** tugmasi → bosing
2. Sizga endpoint URL ko'rsatadi:
   ```
   https://SIZNING-USERNAME-orhun-acestep.hf.space/api/predict
   ```
3. Bu URL'ni `.env` fayliga qo'shing:
   ```
   HF_SPACE_URL=https://SIZNING-USERNAME-orhun-acestep.hf.space
   HF_TOKEN=hf_xxxxx (yuqorida olgan token)
   ```

✅ **Kun 2 tugadi!**

---

## 📅 KUN 3 — Next.js Frontend (Vercel'da)

### 3.1) Next.js loyiha yaratish

Kompyuteringizda:

```bash
cd orhun-ai/frontend

npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Savollarga javoblar:
- ESLint? → Yes
- App Router? → Yes  
- Turbopack? → Yes (tezroq)

### 3.2) Kerakli paketlarni o'rnatish

```bash
npm install @supabase/supabase-js @supabase/ssr next-intl howler zustand lucide-react
npm install -D @types/howler

# shadcn/ui o'rnatish
npx shadcn@latest init
# Tanlovlar: New York, Slate, CSS variables
```

### 3.3) Loyiha strukturasi yaratish

Quyidagi papkalarni yarating:

```
frontend/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx          (landing/home)
│   │   ├── login/
│   │   ├── onboarding/
│   │   ├── home/
│   │   ├── create/
│   │   ├── explore/
│   │   └── song/[id]/
│   ├── api/
│   └── globals.css
├── components/
│   ├── ui/                    (shadcn)
│   ├── player/
│   ├── song-card/
│   └── language-switcher/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── api.ts                 (Oracle backend client)
├── messages/
│   ├── en.json
│   ├── uz.json
│   ├── az.json
│   └── tr.json
├── stores/
│   └── player-store.ts
└── middleware.ts
```

Hozircha bo'sh papkalarni yarating, men keyingi haftalarda har birini to'ldiraman.

### 3.4) `.env.local` fayli

`frontend/.env.local` yarating:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_BACKEND_URL=https://api.orhun-ai.uz  (keyinchalik Oracle URL)
```

### 3.5) GitHub'ga push

```bash
cd ..  # orhun-ai/ rootga
git add .
git commit -m "feat: initial frontend setup"
git push origin main
```

### 3.6) Vercel'ga deploy

1. vercel.com → **Add New** → **Project**
2. GitHub'dan `orhun-ai` repo'ni tanlang
3. **Configure Project:**
   - Framework Preset: **Next.js**
   - **Root Directory:** `frontend` ⚠️ (muhim! frontend papkasini ko'rsating)
   - Build Command: default
4. **Environment Variables** qism:
   - Yuqoridagi 3 ta `NEXT_PUBLIC_*` ni qo'shing
5. **Deploy**

3-5 daqiqa kutish → `orhun-ai-xxxxx.vercel.app` ko'rinishida URL chiqadi.

### 3.7) Custom domain (orhun-ai.vercel.app)

1. Vercel project → **Settings** → **Domains**
2. `orhun-ai.vercel.app` ni qo'shing (bepul vercel.app subdomain)
3. Saytni oching → "Hello, Next.js!" ko'rinishi kerak ✅

✅ **Kun 3 tugadi!**

---

## 📅 KUN 4-5 — Oracle Backend (FastAPI)

### 4.1) Oracle server'ga ulanish

MobaXterm orqali kiring (ARM Ubuntu).

### 4.2) Asosiy paketlarni o'rnatish

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git nginx certbot python3-certbot-nginx ufw
```

### 4.3) Firewall sozlash

```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

⚠️ **MUHIM:** Oracle Cloud Console'da ham **Ingress Rules** qo'shing:
1. Oracle Cloud → Networking → Virtual Cloud Networks
2. Sizning VCN → Security Lists → Default Security List
3. **Add Ingress Rules** → port 80 va 443 ni TCP, 0.0.0.0/0 dan ochish

### 4.4) Backend kodini yuklash

```bash
cd /home/ubuntu
git clone https://github.com/SIZNING-USERNAME/orhun-ai.git
cd orhun-ai/backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4.5) `.env` fayli yaratish

```bash
nano .env
```

Quyidagilarni yozing:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
HF_SPACE_URL=https://USERNAME-orhun-acestep.hf.space
HF_TOKEN=hf_xxxxx
ALLOWED_ORIGINS=https://orhun-ai.vercel.app,http://localhost:3000
```

Saqlash: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.6) Test ishga tushirish

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Brauzeringizda: `http://SIZNING-IP:8000/health` → `{"status": "ok"}` ko'rinishi kerak.

`Ctrl+C` bilan to'xtating.

### 4.7) systemd service (avtomatik ishga tushish)

```bash
sudo cp orhun-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orhun-backend
sudo systemctl start orhun-backend
sudo systemctl status orhun-backend
```

Yashil "active (running)" ko'rinishi kerak ✅

### 4.8) Domain + SSL (ixtiyoriy, lekin tavsiya etiladi)

Agar sizda domain bo'lsa (masalan `api.orhun-ai.uz`):

1. DNS A record: `api.orhun-ai.uz` → Oracle server IP
2. Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/orhun-backend
   ```
3. `backend/nginx-config` faylimni nusxalang
4. Yoqish:
   ```bash
   sudo ln -s /etc/nginx/sites-available/orhun-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
5. SSL:
   ```bash
   sudo certbot --nginx -d api.orhun-ai.uz
   ```

Agar domain yo'q bo'lsa: hozircha Oracle IP bilan ishlatamiz, keyinroq qo'shamiz.

✅ **Kun 4-5 tugadi!**

---

## 📅 KUN 6-7 — Tekshirish va integratsiya

### 7.1) Hammasini tekshirish

| Komponent | URL | Kutilgan natija |
|-----------|-----|-----------------|
| Supabase | supabase.com'da loyiha | Jadvallar ko'rinadi |
| HF Space | username-orhun-acestep.hf.space | Gradio UI ishlaydi |
| Vercel Frontend | orhun-ai.vercel.app | Next.js sahifa |
| Oracle Backend | http://IP:8000/health | `{"status":"ok"}` |

### 7.2) Backend → HF Space test

Oracle'dan HF Space'ga API chaqiruv ishlaydimi tekshiring:

```bash
curl -X POST http://localhost:8000/test-hf
```

Agar `{"audio_url": "..."}` qaytarsa — tayyor!

### 7.3) Frontend → Backend test

Frontend'dan Oracle backend'ga so'rov yuborish tekshiring (CORS sozlangan).

✅ **HAFTA 1 TUGADI!**

---

## 📋 Sizning yakuniy holat

Hafta 1 oxirida sizda quyidagilar bo'ladi:

✅ GitHub repo bilan kod saqlanadigan joy
✅ Supabase'da 6 ta jadval, RLS qoidalari, Google OAuth
✅ HuggingFace'da ACE-Step ishlovchi GPU endpoint
✅ Vercel'da `orhun-ai.vercel.app` ishlovchi sayt
✅ Oracle'da FastAPI backend (24/7 ishlaydi)
✅ Hammasi bir-biriga ulangan

---

## ⚠️ Muammo bo'lsa nima qilish

| Muammo | Yechim |
|--------|--------|
| Supabase SQL xato beradi | Xato matnini menga yuboring, men tahrirlayman |
| HF Space build fail bo'ldi | Logs'ni nusxalang, menga yuboring |
| Vercel deploy ishlamayapti | Vercel logs sahifasini menga ko'rsating |
| Oracle'ga ulanish yo'q | Firewall + Oracle Ingress Rules tekshiring |

Har bir qadamda muammo bo'lsa **MENGA YOZING** — birgalikda hal qilamiz.

---

## ➡️ KEYINGI: Hafta 2

Hafta 1 tugagach, biz Hafta 2'ga o'tamiz:
- Login sahifasi UI (dark blue tema)
- Onboarding 4 ekran (DOB, profile, genres)
- i18n (4 til)
- Foydalanuvchi profili to'ldirish

**Tayyor bo'lganingizni xabar bering — keyingi haftani boshlaymiz!**
