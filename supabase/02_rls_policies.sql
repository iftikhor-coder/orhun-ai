-- ===========================================================
-- ORHUN AI — Row Level Security Policies
-- 01_schema.sql ni Run qilgandan KEYIN bu faylni Run qiling
-- ===========================================================

-- Hamma jadvalga RLS yoqamiz
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- PROFILES policies
-- ===========================================================

-- Hamma boshqa foydalanuvchilarning profilini ko'ra oladi (public info)
CREATE POLICY "profiles_select_all"
    ON public.profiles FOR SELECT
    USING (true);

-- Foydalanuvchi faqat o'z profilini yangilay oladi
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Profil yaratish trigger orqali bo'ladi, lekin ehtiyot uchun:
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ===========================================================
-- GENRES policies (lookup table — hammaga ochiq)
-- ===========================================================
CREATE POLICY "genres_select_all"
    ON public.genres FOR SELECT
    USING (true);

-- ===========================================================
-- USER_GENRES policies
-- ===========================================================
CREATE POLICY "user_genres_select_own"
    ON public.user_genres FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "user_genres_insert_own"
    ON public.user_genres FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_genres_delete_own"
    ON public.user_genres FOR DELETE
    USING (auth.uid() = user_id);

-- ===========================================================
-- SONGS policies (eng muhim!)
-- ===========================================================

-- Foydalanuvchi o'zining hamma songs'ini ko'radi (private + public)
-- + boshqalarning faqat published'larini ko'radi
CREATE POLICY "songs_select"
    ON public.songs FOR SELECT
    USING (
        auth.uid() = user_id  -- o'zining hamma songs
        OR is_published = TRUE  -- yoki boshqalarning published'lari
    );

-- INSERT: Faqat backend (service role) song yaratadi
-- Frontend to'g'ridan-to'g'ri INSERT qila olmaydi (kredit tekshirish kerak)
-- Service role barcha policy'larni aylanib o'tadi, shuning uchun policy yo'q

-- Foydalanuvchi o'z songs'ini yangilay oladi (title, publish status)
CREATE POLICY "songs_update_own"
    ON public.songs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Foydalanuvchi o'z songs'ini o'chira oladi
CREATE POLICY "songs_delete_own"
    ON public.songs FOR DELETE
    USING (auth.uid() = user_id);

-- ===========================================================
-- LIKES policies
-- ===========================================================

-- Hammasi published songs uchun like ko'rinadi
CREATE POLICY "likes_select"
    ON public.likes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.songs 
            WHERE songs.id = likes.song_id 
            AND (songs.is_published = TRUE OR songs.user_id = auth.uid())
        )
    );

-- Foydalanuvchi faqat published songs'ga like qo'ya oladi
CREATE POLICY "likes_insert_own"
    ON public.likes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.songs 
            WHERE songs.id = song_id AND songs.is_published = TRUE
        )
    );

CREATE POLICY "likes_update_own"
    ON public.likes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- ===========================================================
-- COMMENTS policies
-- ===========================================================

CREATE POLICY "comments_select"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.songs 
            WHERE songs.id = comments.song_id 
            AND (songs.is_published = TRUE OR songs.user_id = auth.uid())
        )
    );

CREATE POLICY "comments_insert_own"
    ON public.comments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.songs 
            WHERE songs.id = song_id AND songs.is_published = TRUE
        )
    );

CREATE POLICY "comments_delete_own_or_song_owner"
    ON public.comments FOR DELETE
    USING (
        auth.uid() = user_id  -- o'z comment'ini
        OR auth.uid() IN (SELECT user_id FROM public.songs WHERE id = comments.song_id)  -- yoki song owner moderation qila oladi
    );

-- ===========================================================
-- STORAGE policies
-- ===========================================================

-- Avatars: hammaga ko'rinadi, faqat o'zi yuklaydi
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Songs storage: hammaga ko'rinadi (public bucket)
-- Insert/Update faqat backend (service role) tomonidan
CREATE POLICY "songs_storage_select" ON storage.objects FOR SELECT
    USING (bucket_id = 'songs');

-- ===========================================================
-- TUGADI ✅
-- Keyingi qadam: 03_seed_genres.sql ni ishga tushiring
-- ===========================================================
