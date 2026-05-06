-- ===========================================================
-- ORHUN AI — Database Schema
-- Supabase SQL Editor'da RUN qiling
-- ===========================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================================
-- 1) PROFILES (foydalanuvchi profili — auth.users bilan bog'langan)
-- ===========================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    dob DATE,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'uz', 'az', 'tr')),
    daily_credits INTEGER DEFAULT 4 NOT NULL,
    credits_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('day', NOW()) + INTERVAL '1 day'),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Auth user yaratilganda avtomatik profile yaratish
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        NULL,  -- username keyinroq onboarding'da
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================
-- 2) GENRES (musiqa janrlari, lookup table)
-- ===========================================================
CREATE TABLE public.genres (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_uz TEXT NOT NULL,
    name_az TEXT NOT NULL,
    name_tr TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
);

-- ===========================================================
-- 3) USER_GENRES (foydalanuvchi onboarding'da tanlagan janrlar)
-- ===========================================================
CREATE TABLE public.user_genres (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES public.genres(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, genre_id)
);

-- ===========================================================
-- 4) SONGS (yaratilgan qo'shiqlar)
-- ===========================================================
CREATE TABLE public.songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    prompt TEXT NOT NULL,
    lyrics TEXT,
    genre_ids INTEGER[] DEFAULT '{}',
    voice_type TEXT CHECK (voice_type IN ('male', 'female', 'instrumental')),
    audio_url TEXT,
    duration_seconds INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT FALSE,  -- generatsiya tugaganmi
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    -- Cached counters (performance uchun)
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0
);

CREATE INDEX idx_songs_user_id ON public.songs(user_id);
CREATE INDEX idx_songs_is_published ON public.songs(is_published, published_at DESC) 
    WHERE is_published = TRUE;
CREATE INDEX idx_songs_genre_ids ON public.songs USING GIN(genre_ids);

-- ===========================================================
-- 5) LIKES (like/dislike)
-- ===========================================================
CREATE TABLE public.likes (
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    value SMALLINT NOT NULL CHECK (value IN (-1, 1)),  -- -1 = dislike, 1 = like
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (song_id, user_id)
);

-- Like qo'shilganda counter yangilash
CREATE OR REPLACE FUNCTION public.update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.value = 1 THEN
            UPDATE public.songs SET likes_count = likes_count + 1 WHERE id = NEW.song_id;
        ELSE
            UPDATE public.songs SET dislikes_count = dislikes_count + 1 WHERE id = NEW.song_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.value = 1 THEN
            UPDATE public.songs SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.song_id;
        ELSE
            UPDATE public.songs SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.song_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' AND OLD.value != NEW.value THEN
        IF NEW.value = 1 THEN
            UPDATE public.songs SET likes_count = likes_count + 1, dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = NEW.song_id;
        ELSE
            UPDATE public.songs SET likes_count = GREATEST(0, likes_count - 1), dislikes_count = dislikes_count + 1 WHERE id = NEW.song_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change
    AFTER INSERT OR UPDATE OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_like_counts();

-- ===========================================================
-- 6) COMMENTS
-- ===========================================================
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_song_id ON public.comments(song_id, created_at DESC);

-- Comment counter
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.songs SET comments_count = comments_count + 1 WHERE id = NEW.song_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.songs SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.song_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- ===========================================================
-- 7) HELPER FUNCTIONS
-- ===========================================================

-- Kreditlarni reset qilish (har kuni 00:00 UTC)
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS void AS $$
BEGIN
    UPDATE public.profiles
    SET 
        daily_credits = 4,
        credits_reset_at = DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
    WHERE credits_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kreditni atomic kamaytirish (race condition'siz)
CREATE OR REPLACE FUNCTION public.consume_credit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_credits INTEGER;
BEGIN
    -- Avval reset kerak bo'lsa qilamiz
    UPDATE public.profiles
    SET 
        daily_credits = 4,
        credits_reset_at = DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
    WHERE id = p_user_id AND credits_reset_at <= NOW();

    -- Atomic decrement
    UPDATE public.profiles
    SET daily_credits = daily_credits - 1
    WHERE id = p_user_id AND daily_credits > 0
    RETURNING daily_credits INTO v_credits;

    RETURN v_credits IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================
-- 8) STORAGE BUCKET (audio fayllar uchun)
-- ===========================================================
-- DIQQAT: Bu Supabase Dashboard'dan ham qilsa bo'ladi.
-- Storage → New bucket → "songs" nomi bilan, Public yoqilgan

INSERT INTO storage.buckets (id, name, public)
VALUES ('songs', 'songs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================
-- TUGADI ✅
-- Keyingi qadam: 02_rls_policies.sql ni ishga tushiring
-- ===========================================================
